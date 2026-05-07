export function useGenerateId(): string {
  return (
    Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 15)
  );
}
