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
  const parcelOrPay = valueParcel || discount.value;

  let text = `Proposta de Acordo do *Lote ${lote}*\n\n`;

  if (uniquePay) {
    text += `Preço do Lote: *${formatValue(price)}*\nForma de pagamento: *A vista*\nDesconto: *${qtyParcel > 1 ? 0 : formatValue(discount.discount)}*\nTotal Pago: *${formatValue(parcelOrPay * qtyParcel)}*`
  } else {
    text += `Preço do Lote: *${formatValue(price)}*Forma de pagamento: *${qtyParcel}x de ${formatValue(parcelOrPay)}*\nDesconto: *${qtyParcel > 1 ? 0 : formatValue(discount.discount)}*\nEntrada: *${formatValue(entry)}*\nTotal Pago: *${formatValue((parcelOrPay * qtyParcel) + entry)}*`
  }

  return text
}