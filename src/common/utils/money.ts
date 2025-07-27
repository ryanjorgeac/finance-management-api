export const centsTodollars = ({ value }: { value: any }): number => {
  return Number(value) / 100 || 0;
};
