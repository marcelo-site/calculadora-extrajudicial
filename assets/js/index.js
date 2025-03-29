import { dataLotes } from "./data.js";
import { mascaraMoeda } from "./inputMoeda.js";
import { textProposit } from "./textProposit.js";
import {
    calcularPercentagem,
    formatPrice,
    formatValue,
    handleDiscount,
    percentDiscount
} from "./utils.js";

const modal = document.querySelector("#modal");
const modalLoteNot = document.querySelector("#notLote");
const valueTitle = document.querySelector("#value-title");
const form = document.querySelector('#form');
const selectLote = form.lote;
const qtyParcel = form.qtyParcel;
const loteEl = form.lote;
const uniquePay = form.uniquePay;
const containerPayment = document.querySelector("#container-payment");
const installment = document.querySelector("#container-installment");
const summary = document.querySelector('#summary');
const envProposit = document.querySelector(".btnZap");
const taxValue = 1.5
const taxa = taxValue / 100;
const maxParcel = 60;
let valueParcel = 0;
let valueFinance = 0;

const showNumbers = document.querySelector("#show-numbers");
const containerNumbers = document.querySelector("#container-numbers");
const btnEnvProposit = containerNumbers.querySelectorAll(".btn");

showNumbers.addEventListener("click", () => containerNumbers.classList.remove("none"));

const getLote = () => {
    const numLote = +form.lote.value;
    if (!numLote) return;

    return dataLotes[numLote - 1];
}

const getEntry = (data) => {
    const entryValue = Number(form.entry.value.replace(/\D/g, "")) / 100;
    if (data) return entryValue;

    return form.uniquePay.value === "1" ? 0 : entryValue
}

const handleValueParcel = () => {
    const lote = getLote()
    if (!lote) return;

    const entry = getEntry(true);
    let feesMonth = 0;
    let balanceDebtor = 0;
    valueFinance = lote.price - entry;
    let valueAmortization = 0;

    const arr = [];

    for (let index = 2; index <= maxParcel; index++) {
        let totalPay = 0;
        valueParcel = index <= 4 ?
            valueFinance / index :
            valueFinance * (Math.pow((1 + taxa), index) * taxa) / (Math.pow((1 + taxa), index) - 1);

        if (index === 0) {
            feesMonth = valueFinance -
                (valueFinance - (valueFinance * taxa));
        }

        if (totalPay) {
            feesMonth = balanceDebtor * taxa;
            balanceDebtor = balanceDebtor - (valueParcel - feesMonth);
        } else {
            balanceDebtor = valueFinance - (valueParcel - feesMonth);
        }
        valueAmortization = valueParcel - feesMonth;

        arr.push({
            valueParcel,
            qty: index,
            totalPay: valueParcel * index,
            juros: (valueParcel * index) - valueFinance
        })
    }

    return arr
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
    }
    else {
        const percent = calcularPercentagem(variant, price);
        summary.innerHTML = valuePay(variant, percent, "juro");
    }
}

const handleSummaryJuro = () => {
    const lote = getLote();
    if (!lote) return;

    const qtyParcelValue = +form.qtyParcel.value;
    const entry = getEntry(true);
    const { totalPay, juros } = handleValueParcel()[qtyParcelValue - 2];
    const valuePay = qtyParcelValue > 4 ? totalPay + entry : lote.price;

    handleSummary(valuePay, juros, "juro");
}

const calcular = () => {
    const numLote = +form.lote.value;
    if (!numLote) return;

    const parcelas = handleValueParcel();
    const qtyParcelValue = form.qtyParcel.value;
    qtyParcel.innerHTML = ``

    parcelas.forEach((item, i) => {
        const { qty, valueParcel } = item;
        qtyParcel.innerHTML += `
            <option value="${qty}">${qty} parcelas de ${formatValue(valueParcel)}</option>`
    });

    qtyParcel.value = qtyParcelValue;
    handleSummaryJuro();
}

const emptyValues = () => {
    summary.innerHTML = "";
    containerPayment.classList.add("none");
}

const handleMethod = (e) => {
    const valueMethod = e.target.value;

    const numLote = +form.lote.value;
    if (!numLote) return;

    const lote = dataLotes[numLote - 1];
    if (!lote) return;

    if (valueMethod === "0") {
        const qtyParcelValue = +form.qtyParcel.value;
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
    const parent = e.target.parentNode;
    parent.querySelector("label").classList.add("active")
}

const handleEntry = () => {
    const lote = getLote();
    if (!lote) return;

    const { price } = lote
    const entry = form.entry
    const value = entry.value.replace(/\D/g, "");

    if (+value > price * 100) {
        entry.value = price * 100
    }
    mascaraMoeda(entry);
}

loteEl.addEventListener("change", ({ target }) => {
    const numLote = +target.value;
    if (numLote) {
        const qtyParcelValue = qtyParcel.value;
        const lote = dataLotes[numLote - 1];

        if (!lote.available) {
            envProposit.classList.add("none");
            modalLoteNot.classList.remove("none");
            selectLote.value = "";
            emptyValues();
            return;
        }
        valueTitle.innerHTML = formatPrice(lote.price);
        form.price.value = lote.price;
        const parcelas = handleValueParcel();
        handleEntry();

        parcelas.forEach((item, i) => {
            const { qty, valueParcel } = item;
            if (i === 0) {
                const { value, discount } = handleDiscount(lote.price);
                handleSummary(value, discount, "discount");
            }
            qtyParcel.innerHTML += `
            <option value="${qty}">${qty} parcelas de ${formatValue(valueParcel)}</option>`
        });

        qtyParcel.value = qtyParcelValue || 2
        qtyParcel.addEventListener("change", handleSummaryJuro)

        containerPayment.classList.remove("none");
        envProposit.classList.remove("none");
    }
    else {
        emptyValues();
        envProposit.classList.add("none")
    };
});

form.entry.addEventListener("input", (e) => {
    handleEntry();
    calcular();
});

const submit = (number) => {
    const { lote, qtyParcel, uniquePay } = form;
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
        entry: getEntry(true) / 100,
    });
    window.open(`https://wa.me/55${number}?text=${encodeURIComponent(text)}`, "_blank");
}

btnEnvProposit.forEach(item => {
    item.addEventListener("click", (e) => {
        submit(e.target.getAttribute("data-number"));
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
    })
});
