const percentDiscount = 0.05

const formatValue = (value) => {
  const valueCurrent = Math.abs(value)
  return valueCurrent.toLocaleString('pt-br', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatPrice = (value) => {
  return value.toLocaleString("pt-br", {
    style: "currency",
    currency: "BRL"
  })
}

const handleValueNum = (value) => {
  return parseFloat(value
    .replace(/\./g, '')
    .replace(/\,/g, '.'))
}

const handleDiscount = (value) => {
  return {
    value: Number((value - (value * percentDiscount)).toFixed(2)),
    discount: value * percentDiscount
  }
}

const calcularPercentagem = (parte, total) => (parte / total) * 100;

const handleURL = (key, param) => {
  const path = window.location.toString();
  let url = new URL(path);
  let params = new URLSearchParams(url.search);
  params.set(key, param);

  history.replaceState({}, "", path.split("?")[0] + "?" + params);

}

export { formatValue, formatPrice, handleValueNum, handleDiscount, percentDiscount, calcularPercentagem, handleURL }