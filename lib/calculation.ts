export type CalculationItem = { quantity: number; unitCost: number; unitPrice: number; actualQuantity?: number; invoicedQuantity?: number };

export function money(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }

export function calculateQuote(items: CalculationItem[], overheadPct = 0, riskPct = 0, vatPct = 19) {
  const directCost = money(items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0));
  const baseSales = money(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const overhead = money(directCost * overheadPct / 100);
  const risk = money((directCost + overhead) * riskPct / 100);
  const totalCost = money(directCost + overhead + risk);
  const net = baseSales;
  const profit = money(net - totalCost);
  const marginPct = net > 0 ? money(profit / net * 100) : 0;
  const vat = money(net * vatPct / 100);
  return { directCost, overhead, risk, totalCost, net, vat, gross: money(net + vat), profit, marginPct };
}

export function calculateVariance(items: CalculationItem[]) {
  const plannedCost = money(items.reduce((s, i) => s + i.quantity * i.unitCost, 0));
  const actualCost = money(items.reduce((s, i) => s + (i.actualQuantity ?? 0) * i.unitCost, 0));
  const offeredValue = money(items.reduce((s, i) => s + i.quantity * i.unitPrice, 0));
  const invoicedValue = money(items.reduce((s, i) => s + (i.invoicedQuantity ?? 0) * i.unitPrice, 0));
  return { plannedCost, actualCost, costVariance: money(actualCost - plannedCost), offeredValue, invoicedValue, uninvoicedValue: money(Math.max(0, offeredValue - invoicedValue)) };
}
