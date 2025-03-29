import { formatValue, handleDiscount } from "./utils.js"

export const textProposit = ({
  lote,
  price,
  uniquePay,
  valueParcel,
  qtyParcel,
  entry,
}) => {
  const discount = handleDiscount(price);
  const parcelOrPay = !uniquePay ? valueParcel : discount.value;

  let text = `Proposta de Acordo do *Lote ${lote}*\nValor do Lote: *${formatValue(price)}*\n\n`;

  if (uniquePay) {
    text += `Forma de pagamento: *A vista*\nDesconto: *${qtyParcel > 1 ? 0 : formatValue(discount.discount)}*\nTotal Pago: *${formatValue(parcelOrPay * qtyParcel)}*`
  } else {
    text += `Forma de pagamento: *${qtyParcel}x de ${formatValue(parcelOrPay)}*\nEntrada: *${formatValue(entry)}*\nTotal Pago: *${formatValue((parcelOrPay * qtyParcel) + entry)}*`
  }

  return text
}