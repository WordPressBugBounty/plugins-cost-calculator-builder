export function customBtoa(data: any): string {
  if (typeof data !== "string") {
    data = JSON.stringify(data);
  }

  const replacedData: string = data.replace(/\\"/g, '\\\\\\"');

  return window.btoa(
    encodeURIComponent(replacedData).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      // urldecode() converts literal "+" into a space, so we preserve "%2B" as-is
      // and let urldecode() convert it back to "+" safely.
      if (p1 === "2B") return match; // keep "%2B"

      return String.fromCharCode(Number("0x" + p1));
    }),
  );
}
