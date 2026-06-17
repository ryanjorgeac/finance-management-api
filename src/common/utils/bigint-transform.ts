export const bigintToString = (value: bigint): string => {
  if (value === null || value === undefined) {
    return '0';
  }
  return value.toString();
};

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const bigintToMoneyString = (value: bigint): string => {
  if (value === null || value === undefined) {
    return '0,00';
  }
  const valueInReais = Number(value) / 100;
  return brlFormatter.format(valueInReais);
};

export const stringToBigint = ({ value }: { value: string }): bigint => {
  return BigInt(value);
};

export const centsToReais = ({ value }: { value: bigint }): bigint => {
  return value / 100n;
};

export const centsToBigInt = (cents: number): bigint => {
  return BigInt(cents);
};
