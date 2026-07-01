export const bigintToString = (value: bigint): string => {
  if (value === null || value === undefined) {
    return '0';
  }
  return value.toString();
};

export const bigintToMoneyString = (value: bigint): string => {
  if (value === null || value === undefined) {
    return '0,00';
  }
  const isNegative = value < 0n;
  const absoluteValue = isNegative ? -value : value;
  const reais = absoluteValue / 100n;
  const cents = absoluteValue % 100n;
  const formattedReais = reais.toLocaleString('pt-BR');
  const formattedCents = cents.toString().padStart(2, '0');
  const valueInReais = `${formattedReais},${formattedCents}`;

  return isNegative ? `-${valueInReais}` : valueInReais;
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
