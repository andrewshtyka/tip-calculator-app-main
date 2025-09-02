import currency from "currency.js";
import AutoNumeric from "autonumeric";
import { gsap } from "gsap";

const dataStorage = JSON.parse(localStorage.getItem("settings")) || {};
const inputBill = document.getElementById("bill");
const inputsRadioTip = document.querySelectorAll('[name="tip"]');
const inputCustomTip = document.getElementById("tip-custom");
const inputPeople = document.getElementById("people");
const resultTipAmount = document.getElementById("result-tip");
const resultTotal = document.getElementById("result-total");
const buttonReset = document.getElementById("button-reset");
const lastValues = new WeakMap();
let values = {};
let anBill;

initFunction();

function initFunction() {
  gsap.from([".o-header", ".c-card"], {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power1.inOut",
    stagger: 0.2,
  });

  // retrieve data from local storage
  retrieveTextInputs();
  retrieveRadioInputs();

  anBill = new AutoNumeric(inputBill, {
    digitGroupSeparator: ",",
    decimalCharacter: ".",
    decimalPlaces: 2,
    modifyValueOnWheel: true,
    selectOnFocus: false,
  });

  inputBill.addEventListener("input", () => {
    storeTextInputs(inputBill.id, anBill.getNumber().toString());
    updateValues();
  });

  // reset
  buttonReset.addEventListener("click", resetAll);

  // send text data to save function
  const inputsTypeText = document.querySelectorAll(
    'input[type="number"], input[type="text"]'
  );
  inputsTypeText.forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "-" || e.key === "e" || e.key === "," || e.key === " ") {
        e.preventDefault();
      }

      if (input.matches("#people")) {
        if (e.key === "." || e.key === ",") {
          e.preventDefault();
        }
      }
    });

    inputBill.addEventListener("input", () => {
      if (anBill.getNumber() > 99999) {
        anBill.set(99999);
      }

      storeTextInputs(inputBill.id, anBill.getNumber().toString());
      updateValues();
    });

    input.addEventListener("input", (event) => {
      if (input.matches("#tip-custom") && input.value > 100) {
        input.value = 100;
      }

      if (input.value > 1000) {
        input.value = 1000;
      }
      storeTextInputs(event.target.id, event.target.value.trim());
      updateValues();
    });
  });

  // send radio data to save function
  const inputsTypeRadio = document.querySelectorAll('input[type="radio"]');
  inputsTypeRadio.forEach((input) => {
    input.addEventListener("change", (event) => {
      event.target.checked = true;
      storeRadioInputs(event.target.id, event.target.value);
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.target.checked = true;
        storeRadioInputs(event.target.id, event.target.value);
      }
    });
  });

  // send Tip% data for check (take data from radio or input)
  const inputsRadioTip = document.querySelectorAll('[name="tip"]');
  const inputCustomTip = document.getElementById("tip-custom");

  inputsRadioTip.forEach((input) => {
    if (input.hasAttribute.checked) {
      switchRadioAndInput(input);
    } else {
      input.addEventListener("change", (event) => {
        event.target.checked = true;
        switchRadioAndInput(event.target);
      });
    }
  });

  const radioLabels = document.querySelectorAll(".c-radio label");
  radioLabels.forEach((label) => {
    label.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault(); // щоб не скролило сторінку
        const input = document.getElementById(label.getAttribute("for"));
        input.checked = true;
        switchRadioAndInput(input);
        updateValues();
      }

      if (e.key === "Escape") {
        e.preventDefault(); // щоб не скролило сторінку
        const input = document.getElementById(label.getAttribute("for"));
        input.checked = false;
        switchRadioAndInput(input);
        updateValues();
      }
    });
  });

  inputCustomTip.addEventListener("input", () => {
    switchRadioAndInput(inputCustomTip);
  });

  // count tips and total
  initCountListeners();
  updateValues();

  // validate
  validationBill();
  validationPeople();
}

// save text data to local storage
function storeTextInputs(inputID, value) {
  dataStorage[inputID] = Number(value.replace(/,/g, ""));
  localStorage.setItem("settings", JSON.stringify(dataStorage));
}

// ========================================
//
// retrieve text data from local storage
function retrieveTextInputs() {
  const inputsTypeText = document.querySelectorAll(
    'input[type="number"], input[type="text"]'
  );
  inputsTypeText.forEach((input) => {
    if (!input.value && !dataStorage[input.id]) {
      input.value = "";
    } else if (!input.value && dataStorage[input.id]) {
      input.value = dataStorage[input.id];
    }
  });
}

// ========================================
//
// save radio data to local storage
function storeRadioInputs(radioID, value) {
  // delete custom input
  delete dataStorage["tip-custom"];

  // delete other radios
  Object.keys(dataStorage).forEach((key) => {
    if (key.startsWith("tip")) delete dataStorage[key];
  });

  dataStorage[radioID] = value;
  localStorage.setItem("settings", JSON.stringify(dataStorage));
}

// ========================================
//
// retrieve radio data from local storage
function retrieveRadioInputs() {
  const inputsTypeRadio = document.querySelectorAll('input[type="radio"]');
  const inputCustomTip = document.getElementById("tip-custom");

  inputsTypeRadio.forEach((input) => {
    if (dataStorage[input.id] && !inputCustomTip.value) {
      input.checked = true;
    }
  });
}

// ========================================
//
// switch between radio and custom input for tip %
function switchRadioAndInput(input) {
  const inputRadioChecked = document.querySelector('[name="tip"]:checked');
  const inputCustomTip = document.getElementById("tip-custom");

  if (input.id === "tip-custom") {
    // custom input gets value
    if (input.value.trim() !== "") {
      // reset radio
      if (inputRadioChecked) inputRadioChecked.checked = false;

      // delete radio from storage
      Object.keys(dataStorage).forEach((key) => {
        if (key.startsWith("tip")) delete dataStorage[key];
      });

      dataStorage["tip-custom"] = input.value.trim();
      localStorage.setItem("settings", JSON.stringify(dataStorage));
    }
  } else {
    // radio is checked
    if (input.checked) {
      // delete custom input from storage
      delete dataStorage["tip-custom"];
      localStorage.setItem("settings", JSON.stringify(dataStorage));

      // clear custom input
      inputCustomTip.value = "";
    }
  }
}

// ========================================
//
// initialize listeners for inputs (to get values)
function initCountListeners() {
  inputBill.addEventListener("input", updateValues);
  inputsRadioTip.forEach((input) =>
    input.addEventListener("change", updateValues)
  );
  inputCustomTip.addEventListener("input", updateValues);
  inputPeople.addEventListener("input", updateValues);
}

// ========================================
//
// take values from inputs and put into 'values' object
function updateValues() {
  const inputRadioTip = document.querySelector('[name="tip"]:checked');
  values.bill = inputBill.value;
  values.people = inputPeople.value;
  values.tip = inputRadioTip ? inputRadioTip.value : inputCustomTip.value;

  countTipAndTotal();
  resetAvailable(values.bill, values.tip, values.people);
}

// ========================================
//
// calculate tip and total amount
function countTipAndTotal() {
  let bill = Number(values.bill.replace(/,/g, "")) || 0;
  let tip = Number(values.tip) || 0;
  let people = Number(values.people) || 0;

  let tipAmount = 0;
  let totalAmount = 0;

  if (bill > 0 && people > 0) {
    tipAmount = (bill * tip) / 100 / people;
    totalAmount = bill / people + tipAmount;
  }

  animateValue(resultTipAmount, tipAmount);
  animateValue(resultTotal, totalAmount);
}

// ========================================
//
// validate input Bill
function validationBill() {
  inputBill.addEventListener("blur", () => {
    const errorBill = document.getElementById("error-bill");
    if (inputBill.value <= 0) {
      errorBill.hidden = false;
      inputBill.classList.add("u-input_error");
      errorBill.textContent = "Can’t be zero";
    } else {
      errorBill.hidden = true;
      inputBill.classList.remove("u-input_error");
      errorBill.textContent = "";
    }
  });

  inputBill.addEventListener("input", () => {
    const errorBill = document.getElementById("error-bill");
    if (inputBill.value <= 0) {
      errorBill.hidden = false;
      inputBill.classList.add("u-input_error");
      errorBill.textContent = "Can’t be zero";
    } else {
      errorBill.hidden = true;
      inputBill.classList.remove("u-input_error");
      errorBill.textContent = "";
    }
  });
}

// ========================================
//
// validate input People
function validationPeople() {
  inputPeople.addEventListener("input", () => {
    const errorPeople = document.getElementById("error-people");
    if (!inputPeople.value || inputPeople.value <= 0) {
      errorPeople.hidden = false;
      inputPeople.classList.add("u-input_error");
      errorPeople.textContent = "Can’t be zero";
    } else {
      errorPeople.hidden = true;
      inputPeople.classList.remove("u-input_error");
      errorPeople.textContent = "";
    }
  });

  inputPeople.addEventListener("blur", () => {
    const errorPeople = document.getElementById("error-people");
    if (!inputPeople.value || inputPeople.value <= 0) {
      errorPeople.hidden = false;
      inputPeople.classList.add("u-input_error");
      errorPeople.textContent = "Can’t be zero";
    } else {
      errorPeople.hidden = true;
      inputPeople.classList.remove("u-input_error");
      errorPeople.textContent = "";
    }
  });
}

// ========================================
//
// Reset button
function resetAll(event) {
  event.preventDefault();

  anBill.clear();
  inputPeople.value = "";
  inputCustomTip.value = "";

  values = {};
  localStorage.removeItem("settings");

  inputsRadioTip.forEach((input) => {
    input.checked = false;
  });

  //clean mistakes
  document.querySelectorAll(".u-input_error").forEach((el) => {
    el.classList.remove("u-input_error");
  });

  document.querySelectorAll("[id^='error-']").forEach((err) => {
    err.hidden = true;
    err.textContent = "";
  });

  updateValues();
}

// ========================================
//
// make button disabled if inputs are empty
function resetAvailable(billEl, tipEl, peopleEl) {
  if (billEl || tipEl || peopleEl) {
    buttonReset.classList.remove("u-button_disabled");
  } else {
    buttonReset.classList.add("u-button_disabled");
  }
}

// ========================================
//
// animate total figures
function animateValue(element, newValue) {
  const prev = lastValues.get(element) ?? 0;
  const obj = { val: prev };

  gsap.to(obj, {
    val: newValue,
    duration: 0.5,
    ease: "circ.inOut",
    onUpdate: () => {
      element.textContent = currency(obj.val, {
        separator: ",",
      }).format();
    },
    onComplete: () => {
      lastValues.set(element, newValue);
    },
  });
}
