import { shallowRef, type Ref, onBeforeUnmount } from "vue";
import {
  Decoration,
  EditorView,
  keymap,
  MatchDecorator,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { RangeSetBuilder, EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { defaultKeymap } from "@codemirror/commands";
import { syntaxTree } from "@codemirror/language";
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint";
import { CCBSyntax } from "./syntax/ccb-language.js";
import type { IAvailableField } from "./formula.types";
import { VALID_FUNCTIONS } from "./formulaMappings";

// ---------------------------------------------------------------------------
// Regex builders
// ---------------------------------------------------------------------------

function buildLetterRegex(fields: IAvailableField[]): RegExp | null {
  if (!fields.length) return null;
  const pattern = fields.map((f) => escapeRegExp(f.letter)).join("|");
  return new RegExp(`\\b(${pattern})\\b`, "g");
}

function buildOperatorRegex(): RegExp {
  const keywordList = [
    "POW",
    "SQRT",
    "ROUND",
    "CEIL",
    "FLOOR",
    "ABS",
    "OR",
    "AND",
    "MIN",
    "MAX",
  ];
  const specialCharacters = String.raw`;|\?|:|=|\!|>|<|\*|/|\+|\-|%|,`;
  const combinedPattern = `(?:\\b(?:${keywordList.join("|")})(?:\\((?:[^)(]|\\((?:[^)(]+|\\([^)(]*\\))*\\))*\\))?|[${specialCharacters}])`;
  return new RegExp(combinedPattern, "g");
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Decoration plugins (ported from formula-field.js)
// ---------------------------------------------------------------------------

function createLetterPlugin(fields: IAvailableField[]) {
  const regex = buildLetterRegex(fields);
  if (!regex) return [];

  const matcher = new MatchDecorator({
    regexp: regex,
    decoration: () => Decoration.mark({ class: "ccb-formula-field-letter" }),
  });

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = matcher.createDeco(view);
      }
      update(update: ViewUpdate) {
        this.decorations = matcher.updateDeco(update, this.decorations);
      }
    },
    {
      decorations: (instance) => instance.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.decorations || Decoration.none;
        }),
    },
  );
}

function createOperatorPlugin() {
  const regex = buildOperatorRegex();
  const matcher = new MatchDecorator({
    regexp: regex,
    decoration: () => Decoration.mark({ class: "ccb-formula-operator" }),
  });

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = matcher.createDeco(view);
      }
      update(update: ViewUpdate) {
        this.decorations = matcher.updateDeco(update, this.decorations);
      }
    },
    {
      decorations: (instance) => instance.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.decorations || Decoration.none;
        }),
    },
  );
}

function createIfElsePlugin() {
  return ViewPlugin.fromClass(
    class {
      colorStack: string[] = [];
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      generateColor(nestingLevel: number): string {
        const baseHue = 2210;
        const hueIncrement = 70;
        const hue = (baseHue + nestingLevel * hueIncrement) % 360;
        const className = `nesting-color-${nestingLevel}`;
        const color = `hsl(${hue}, 100%, 50%)`;
        if (!document.querySelector(`.${className}`)) {
          const style = document.createElement("style");
          style.innerHTML = `.${className} { color: ${color}; }`;
          document.head.appendChild(style);
        }
        return className;
      }

      buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        this.colorStack = [];

        syntaxTree(view.state).iterate({
          enter: ({ type, from, to }) => {
            if (type.name === "IfStatement") {
              this.colorStack.push(this.generateColor(this.colorStack.length));
            }
            if (this.colorStack.length > 0) {
              const className = this.colorStack[this.colorStack.length - 1];
              if (type.name === "IfStatement") {
                builder.add(from, to, Decoration.mark({ class: className }));
              } else if (
                type.name === "ParenthesizedExpression" &&
                !view.state.doc.sliceString(from - 3, from).match(/IF\s*$/)
              ) {
                builder.add(
                  from,
                  to,
                  Decoration.mark({ class: "ccb-formula-operator" }),
                );
              } else if (type.name === "VariableName") {
                builder.add(
                  from,
                  to,
                  Decoration.mark({
                    class: "ccb-formula-field-letter-not-exist",
                  }),
                );
              }
            }
          },
          leave: ({ type }) => {
            if (type.name === "IfStatement") {
              this.colorStack.pop();
            }
          },
        });

        return builder.finish();
      }
    },
    {
      decorations: (v) => v.decorations,
    },
  );
}

// ---------------------------------------------------------------------------
// Linter (ported from formula-field.js linterHandler)
// ---------------------------------------------------------------------------

function collectDiagnostics(
  view: EditorView,
  fields: IAvailableField[],
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const tree = syntaxTree(view.state);
  const doc = view.state.doc.toString();

  const leadingOpMatch = doc.match(/^(\s*)([*/%])/);
  if (leadingOpMatch) {
    const opPos = leadingOpMatch[1].length;
    diagnostics.push({
      from: opPos,
      to: opPos + 1,
      severity: "error",
      message: `Operator "${leadingOpMatch[2]}" is missing a left-hand value`,
      actions: [
        {
          name: "Remove",
          apply(view, from, to) {
            view.dispatch({ changes: { from, to } });
          },
        },
      ],
    });
  }

  const danglingOpPattern = /[+\-*/%({,;:?^]\s*([*/%])/g;
  let match;
  while ((match = danglingOpPattern.exec(doc)) !== null) {
    const opPos = match.index + match[0].length - 1;
    diagnostics.push({
      from: opPos,
      to: opPos + 1,
      severity: "error",
      message: `Operator "${match[1]}" is missing a left-hand value`,
      actions: [
        {
          name: "Remove",
          apply(view, from, to) {
            view.dispatch({ changes: { from, to } });
          },
        },
      ],
    });
  }

  tree.cursor().iterate((node) => {
    const nextNode = tree.resolve(node.to, 1);

    if (node.name === "ArithOp" && nextNode.name === "ArithOp") {
      diagnostics.push({
        from: node.from,
        to: node.to,
        severity: "error",
        message: "Repeated math operator",
        actions: [
          {
            name: "Remove",
            apply(view, from, to) {
              view.dispatch({ changes: { from, to } });
            },
          },
        ],
      });
    }

    if (node.type.isError && view.state.doc.length > 0) {
      diagnostics.push({
        from: node.from,
        to: node.to,
        severity: "error",
        message: "An error expression found, please fix it",
      });
    }

    if (
      node.name === "," &&
      syntaxTree(view.state).resolveInner(node.from).name !== "ArgList"
    ) {
      diagnostics.push({
        from: node.from,
        to: node.to,
        severity: "error",
        message: "The decimal separator should be a period.",
        actions: [
          {
            name: "Remove",
            apply(view, from, to) {
              view.dispatch({ changes: { from, to } });
            },
          },
        ],
      });
    }

    if (node.name === "VariableName" && !node.type.isError) {
      const identifier = view.state.doc
        .toString()
        .substring(node.from, node.to)
        .trim();

      const letterExists = fields.some((f) => f.letter === identifier);
      const functionExists = (VALID_FUNCTIONS as readonly string[]).includes(
        identifier,
      );

      if (!letterExists && !functionExists) {
        diagnostics.push({
          from: node.from,
          to: node.to,
          severity: "error",
          message: "Error: Nonexistent letters are used",
          actions: [
            {
              name: "Remove",
              apply(view, from, to) {
                view.dispatch({ changes: { from, to } });
              },
            },
          ],
        });
      }
    }
  });

  return diagnostics;
}

function createFormulaLinter(fields: Ref<IAvailableField[]>) {
  return linter((view) => collectDiagnostics(view, fields.value));
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export interface UseFormulaEditorOptions {
  fields: Ref<IAvailableField[]>;
  onChange: (displayFormula: string) => void;
}

export function useFormulaEditor(options: UseFormulaEditorOptions) {
  const { fields, onChange } = options;
  const editor = shallowRef<EditorView | null>(null);

  function initEditor(container: HTMLElement, initialDoc: string): void {
    destroyEditor();

    const letterPlugin = createLetterPlugin(fields.value);
    const operatorPlugin = createOperatorPlugin();
    const ifElsePlugin = createIfElsePlugin();
    const formulaLinter = createFormulaLinter(fields);

    const uppercaseHandler = EditorView.inputHandler.of(
      (_view, from, to, text) => {
        const upper = text.toUpperCase();
        _view.dispatch({
          changes: { from, to, insert: upper },
          selection: { anchor: from + upper.length },
          scrollIntoView: true,
        });
        onChange(_view.state.doc.toString());
        return true;
      },
    );

    const extensions = [
      basicSetup,
      keymap.of(defaultKeymap),
      EditorView.lineWrapping,
      ...(Array.isArray(letterPlugin) ? letterPlugin : [letterPlugin]),
      operatorPlugin,
      ifElsePlugin,
      formulaLinter,
      uppercaseHandler,
      lintGutter(),
      CCBSyntax(),
    ];

    const state = EditorState.create({
      doc: initialDoc,
      extensions,
    });

    editor.value = new EditorView({
      parent: container,
      state,
    });

    editor.value.dom.addEventListener("focusout", () => {
      setTimeout(() => {
        if (editor.value) {
          onChange(editor.value.state.doc.toString());
        }
      });
    });
  }

  function insertAtCursor(text: string): void {
    const view = editor.value;
    if (!view || !text) return;

    const selection = view.state.selection.main;
    let cursorOffset = text.length;

    if (text.length > 5) {
      for (let i = 0; i < text.length; i++) {
        if (text[i] === "(") {
          cursorOffset = i + 1;
          break;
        }
      }
    }

    view.dispatch({
      changes: {
        from: selection.head,
        to: selection.head,
        insert: text,
      },
      selection: {
        anchor: selection.head + cursorOffset,
        head: selection.head + cursorOffset,
      },
    });
    view.contentDOM.focus();
    onChange(view.state.doc.toString());
  }

  function getDisplayFormula(): string {
    return editor.value?.state.doc.toString() ?? "";
  }

  function replaceContent(newDoc: string): void {
    const view = editor.value;
    if (!view) return;

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: newDoc,
      },
    });
  }

  function getDiagnostics(): Diagnostic[] {
    const view = editor.value;
    if (!view) return [];
    return collectDiagnostics(view, fields.value);
  }

  function hasErrors(): boolean {
    return getDiagnostics().some((d) => d.severity === "error");
  }

  function destroyEditor(): void {
    if (editor.value) {
      editor.value.destroy();
      editor.value = null;
    }
  }

  onBeforeUnmount(() => {
    destroyEditor();
  });

  return {
    editor,
    initEditor,
    insertAtCursor,
    getDisplayFormula,
    getDiagnostics,
    hasErrors,
    replaceContent,
    destroyEditor,
  };
}
