export default function formatNumber(
  num: number,
  thousandSep: string = ",",
  decimals: number = 0,
  decimalSep: string = ".",
): string {
  const parts = Number(num).toFixed(decimals).split(".");
  let integerPart = parts[0];
  const decimalPart = parts[1] || "";

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);

  return decimals > 0 ? integerPart + decimalSep + decimalPart : integerPart;
}
