export function formatChartTime(
  value: string,
): string {
  return new Date(value).toLocaleTimeString(
    "tr-TR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export function formatChartDateTime(
  value: unknown,
): string {
  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    return "";
  }

  return new Date(value).toLocaleString(
    "tr-TR",
  );
}