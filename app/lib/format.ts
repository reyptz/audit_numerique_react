export const money = (n: number | string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 })
    .format(typeof n === 'string' ? parseFloat(n) : n);

export const percent = (n: number | string) =>
  new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 })
    .format(typeof n === 'string' ? parseFloat(n) : n);
