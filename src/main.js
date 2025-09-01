// FEATURES & LOGIC
//
// ❌ add custom formatting for bill value inside input
//
// ❌ click on RESET:
// - bill === 0
// - custom tip === '' and 5% checked
// - people === 0
//
//
import currency from "currency.js";

const dataStorage = JSON.parse(localStorage.getItem("settings")) || {};
const inputBill = document.getElementById("bill");
const inputsRadioTip = document.querySelectorAll('[name="tip"]');
const inputCustomTip = document.getElementById("tip-custom");
const inputPeople = document.getElementById("people");
const resultTipAmount = document.getElementById("result-tip");
const resultTotal = document.getElementById("result-total");
let values = {};

initFunction();

function initFunction() {
  // retrieve data from local storage
  retrieveTextInputs();
  retrieveRadioInputs();

  // send text data to save function
  const inputsTypeText = document.querySelectorAll('input[type="number"]');
  inputsTypeText.forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "-" || e.key === "e" || e.key === ",") {
        e.preventDefault();
      }

      if (input.matches("#people")) {
        if (e.key === "." || e.key === ",") {
          e.preventDefault();
        }
      }
    });

    input.addEventListener("input", (event) => {
      if (input.matches("#tip-custom") && input.value > 100) {
        input.value = 100;
      }
      if (input.value < 0) input.value = "";

      storeTextInputs(event.target.id, event.target.value.trim());
    });
  });

  // send radio data to save function
  const inputsTypeRadio = document.querySelectorAll('input[type="radio"]');
  inputsTypeRadio.forEach((input) => {
    input.addEventListener("change", (event) => {
      event.target.setAttribute.checked;
      storeRadioInputs(event.target.id, event.target.value);
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

  inputCustomTip.addEventListener("input", () => {
    switchRadioAndInput(inputCustomTip);
  });

  // count tips and total
  initCountListeners();
  updateValues();

  // validate
  validationBill();
  validationPeople();
  validationCustomTip();
}

// save text data to local storage
function storeTextInputs(inputID, value) {
  dataStorage[inputID] = value;
  localStorage.setItem("settings", JSON.stringify(dataStorage));
}

// ========================================
//
// retrieve text data from local storage
function retrieveTextInputs() {
  const inputsTypeText = document.querySelectorAll('input[type="number"]');
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
}

// ========================================
//
// calculate tip and total amount
function countTipAndTotal() {
  let bill = Number(values.bill) || 0;
  let tip = Number(values.tip) || 0;
  let people = Number(values.people) || 0;

  if (bill > 0 && tip > 0 && people > 0) {
    // condition 1
    let tipAmount = (bill * tip) / 100 / people;
    let totalAmount = bill / people + tipAmount;
    resultTipAmount.textContent = currency(tipAmount, {
      separator: ",",
    }).format();
    resultTotal.textContent = currency(totalAmount, {
      separator: ",",
    }).format();
  } else if (bill > 0 && tip === 0 && people > 0) {
    // condition 2
    let tipAmount = 0;
    let totalAmount = bill / people + tipAmount;
    resultTipAmount.textContent = currency(tipAmount, {
      separator: ",",
    }).format();
    resultTotal.textContent = currency(totalAmount, {
      separator: ",",
    }).format();
  } else if (bill > 0 && tip === "" && people > 0) {
    // condition 3
    let tipAmount = 0;
    let totalAmount = bill / people + tipAmount;
    resultTipAmount.textContent = currency(tipAmount, {
      separator: ",",
    }).format();
    resultTotal.textContent = currency(totalAmount, {
      separator: ",",
    }).format();
  } else {
    // condition 4
    resultTipAmount.textContent = currency(tipAmount, {
      separator: ",",
    }).format();
    resultTotal.textContent = currency(totalAmount, {
      separator: ",",
    }).format();
  }
}

// ========================================
//
// validate input Bill
function validationBill() {
  inputBill.addEventListener("blur", () => {
    const errorBill = document.getElementById("error-bill");
    if (inputBill.value <= 0) {
      errorBill.hidden = false;
      errorBill.textContent = "Can’t be zero";
    } else {
      errorBill.textContent = "";
      errorBill.hidden = true;
    }
  });

  inputBill.addEventListener("input", () => {
    const errorBill = document.getElementById("error-bill");
    if (inputBill.value <= 0) {
      errorBill.hidden = false;
      errorBill.textContent = "Can’t be zero";
    } else {
      errorBill.textContent = "";
      errorBill.hidden = true;
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
      errorPeople.textContent = "Can’t be zero";
    } else {
      errorPeople.textContent = "";
      errorPeople.hidden = true;
    }
  });

  inputPeople.addEventListener("blur", () => {
    const errorPeople = document.getElementById("error-people");
    if (!inputPeople.value || inputPeople.value <= 0) {
      errorPeople.hidden = false;
      errorPeople.textContent = "Can’t be zero";
    } else {
      errorPeople.textContent = "";
      errorPeople.hidden = true;
    }
  });
}
