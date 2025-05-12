import { inject } from "vue";

export function useInjectedStore<T extends (...args: any) => any>(
  useStoreFn: T,
): ReturnType<T> {
  const pinia = inject("pinia");
  if (!pinia) throw new Error("Pinia instance not found");
  return useStoreFn(pinia);
}
