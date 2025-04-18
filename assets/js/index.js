import { dataLotes } from "./data.js";
import { mascaraMoeda } from "./inputMoeda.js";
import { textProposit } from "./textProposit.js";
import {
    calcularPercentagem,
    formatPrice,
    formatValue,
    getParamUrl,
    handleDiscount,
    handleURL,
    percentDiscount,
    taxValue
} from "./utils.js";

const form = document.querySelector('#form');
const { lote: selectLote, entry, uniquePay, qtyParcel } = form

const modal = document.querySelector("#modal");
const modalLoteNot = document.querySelector("#notLote");
const valueTitle = document.querySelector("#value-title");
const containerPayment = form.querySelector("#container-payment");
const installment = containerPayment.querySelector("#container-installment");
const summary = form.querySelector('#summary');
const envProposit = document.querySelector("#show-numbers");
const containerNumbers = document.querySelector("#container-numbers");
const btnEnvProposit = containerNumbers.querySelectorAll(".btn");

const taxa = taxValue / 100;
const maxParcel = 60;

envProposit.addEventListener("click", () => containerNumbers.classList.remove("none"));

const getLote = () => {
    const numLote = +selectLote.value;
    return numLote ? dataLotes[numLote - 1] : undefined;
}

const getEntry = (data) => {
    const entryValue = Number(entry.value.replace(/\D/g, "")) / 100;
    if (data) return entryValue;
    return uniquePay.value === "1" ? 0 : entryValue;
}

const handleValueParcel = () => {
    const lote = getLote()
    if (!lote) return;

    const entry = getEntry(true);
    const valueFinance = lote.price - entry;
    const dataArr = [];
    let index = 2
    for (; index <= maxParcel; index++) {
        const valueParcel = index <= 4 ?
            valueFinance / index :
            valueFinance * (Math.pow((1 + taxa), index) * taxa) / (Math.pow((1 + taxa), index) - 1);

        dataArr.push({
            valueParcel,
            qty: index,
            totalPay: valueParcel * index,
            juros: (valueParcel * index) - valueFinance
        })
    }
    return dataArr;
}

const handleSummary = (price, variant, type) => {
    const valuePay = (parte, percent) => `
    <div class="qtyParcel">
    <span>${formatPrice(price)}</span>
    <div class="targetOff flex ${type === "juro" ? "red" : ""}">
    <span>${type === "juro" ? "+" : "-"} ${formatValue(parte)}</span>
    <span style="${type === "juro" ? "background: red;" : "background: var(--color-green)"}" class="flex">
    <i class="bi bi-arrow-down-short"></i> ${percent.toFixed(0)}%</span>
    </div>
    </div>`

    if (type === "discount") {
        summary.innerHTML = valuePay(variant, percentDiscount * 100)
    } else {
        const percent = calcularPercentagem(variant, price);
        summary.innerHTML = valuePay(variant, percent, "juro");
    }
}

const handleSummaryJuro = () => {
    const lote = getLote();
    if (!lote) return;

    const qtyParcelValue = +qtyParcel.value;
    const entry = getEntry(true);
    const { totalPay, juros } = handleValueParcel()[qtyParcelValue - 2];
    const valuePay = qtyParcelValue > 4 ? totalPay + entry : lote.price;

    handleSummary(valuePay, juros, "juro");
}

const calcular = () => {
    const numLote = +selectLote.value;
    if (!numLote) return;

    const parcelas = handleValueParcel();
    const qtyParcelValue = qtyParcel.value;
    qtyParcel.innerHTML = ``

    parcelas.forEach(({ qty, valueParcel }) => {
        qtyParcel.innerHTML += `
            <option value="${qty}">${qty} parcelas de ${formatValue(valueParcel)}</option>`
    });

    qtyParcel.value = qtyParcelValue;
    if (uniquePay.value === "0") handleSummaryJuro();
}

const emptyValues = () => {
    summary.innerHTML = "";
    containerPayment.classList.add("none");
}

const handleMethod = (e) => {
    const lote = getLote();
    if (!lote) return;

    const valueMethod = e.target.value;
    if (valueMethod === "0") {
        const qtyParcelValue = +qtyParcel.value;
        installment.classList.remove("none");
        qtyParcel.value = qtyParcelValue || 2;
        containerPayment.classList.remove("none");
        handleSummaryJuro();
    }
    else {
        emptyValues();
        const { value, discount } = handleDiscount(lote.price);
        handleSummary(value, discount, "discount");
        containerPayment.classList.remove("none");
        installment.classList.add("none");
    }
    uniquePay.forEach((item) =>
        item.parentNode.querySelector("label").classList.remove("active")
    );
    e.target.parentNode
        .querySelector("label").classList.add("active");
    calcular();
}

const handleEntry = () => {
    const lote = getLote();
    if (!lote) return;

    const { price } = lote;
    const value = entry.value.replace(/\D/g, "");

    if (+value > price * 100) entry.value = price * 100;
    mascaraMoeda(entry);
}

const handleLote = (n) => {
    const empty = () => {
        envProposit.classList.add("none");
        selectLote.value = "";
        valueTitle.innerHTML = "000,00";
        emptyValues();
    }
    if (!n) return empty();

    const lote = dataLotes[n - 1];
    if (!lote) {
        emptyValues();
        envProposit.classList.add("none");
        return;
    }
    if (!lote.available) {
        modalLoteNot.classList.remove("none");
        return empty();
    }
    const qtyParcelValue = +qtyParcel.value;
    valueTitle.innerHTML = formatValue(lote.price);
    const parcelas = handleValueParcel();
    handleEntry();

    parcelas?.forEach((item, i) => {
        const { qty, valueParcel } = item;
        if (i === 0) {
            const { value, discount } = handleDiscount(lote.price);
            handleSummary(value, discount, "discount");
        }
        qtyParcel.innerHTML += `
            <option value="${qty}">${qty} parcelas de ${formatValue(valueParcel)}</option>`
    });

    qtyParcel.value = qtyParcelValue || 2
    qtyParcel.addEventListener("change", handleSummaryJuro);

    containerPayment.classList.remove("none");
    envProposit.classList.remove("none");
    calcular();
}

selectLote.addEventListener("change", ({ target }) => {
    handleLote(+target.value);
    handleURL("lote", target.value);
});

entry.addEventListener("input", () => {
    handleEntry();
    calcular();
});

const submit = (number) => {
    const countParcels = uniquePay.value === "1" ? 1 : Number(qtyParcel.value);
    const dataParcel = handleValueParcel()[+qtyParcel.value - 2];
    const data = getLote();
    const text = textProposit({
        lote: Number(lote.value),
        price: data.price,
        uniquePay: uniquePay.value === "1",
        qtyParcel: countParcels,
        percentDiscount,
        valueParcel: dataParcel.valueParcel,
        entry: getEntry(true),
    });
    window.open(`https://wa.me/55${number}?text=${encodeURIComponent(text)}`, "_blank");
}

btnEnvProposit.forEach(item => {
    item.addEventListener("click", ({ target }) => {
        submit(target.getAttribute("data-number"));
    })
})

const handleModal = (modalEl) => {
    const toggleModal = () => modalEl.classList.toggle("none");
    modalEl.addEventListener("click", toggleModal);
    modalEl.querySelector("button")?.addEventListener("click", toggleModal);
    modalEl.querySelector("div")?.addEventListener("click", (e) => {
        e.stopPropagation();
    })
}

document.addEventListener("DOMContentLoaded", () => {
    handleModal(modal);
    handleModal(modalLoteNot);
    handleModal(containerNumbers);
    uniquePay.forEach((item) => item.addEventListener("click", handleMethod));

    document.querySelector("#yearCopy").innerHTML = (new Date()).getFullYear();
    document.querySelector("#taxa").innerHTML = `${taxValue}%`;

    dataLotes.forEach(({ lote, available }) => {
        selectLote.innerHTML += `<option value="${lote}">Lote ${lote} ${!available ? "indisponivel" : ""}</option>`
    });

    const loteNum = getParamUrl("lote");
    if (loteNum) {
        selectLote.value = loteNum;
        const { available } = getLote();

        if (!available) selectLote.value = "";
        else handleLote(+selectLote.value);
    }
});
