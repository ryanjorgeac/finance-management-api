export const centsTodollars = ({
  value,
}: {
  value: number | string | bigint;
}): number => {
  return Number(value) / 100 || 0;
};
