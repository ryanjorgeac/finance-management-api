export const bigintToString = (value: bigint): string => {
  if (value === null || value === undefined) {
    return '0';
  }
  return value.toString();
};

export const bigintToMoneyString = (value: bigint): string => {
  if (value === null || value === undefined) {
    return '0.00';
  }
  const cents = typeof value === 'bigint' ? value : BigInt(value);
  const dollars = cents / 100n;
  const centsRemainder = (cents % 100n).toString().padStart(2, '0');
  return `${dollars.toString()}.${centsRemainder}`;
};

export const stringToBigint = ({ value }: { value: string }): bigint => {
  return BigInt(value);
};

export const centsTodollars = ({ value }: { value: bigint }): bigint => {
  return value / 100n;
};

export const dollarsToCents = (dollars: bigint | number): bigint => {
  return BigInt(dollars) * 100n;
};

export const formatCurrency = (cents: bigint, currencySymbol = '$'): string => {
  const dollars = cents / 100n;
  return `${dollars.toString()}.${(cents % 100n).toString().padStart(2, '0')}`;
};
