// FEATURES & LOGIC
//
// ✅ tip per person: (bill * tip) / people
// ✅ total per person: (bill / people) + tip per person
//
//
// ❌ validation on blur:
// - bill must be > 0
// - tip must be selected
// - people must be > 0
//
//
// ✅ tip Custom focused:
// - if value === 0 and other radio is checked, that radio keeps being checked
// - if value !== 0, any other radio is unchecked and final amount is updated depending on value
//
//
// ❌ click on RESET:
// - bill === 0
// - tip === unchecked
// - people === 0
//
//
// ✅ save inputs data to local storage
//
//
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
    input.addEventListener("input", (event) => {
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
}

// save text data to local storage
function storeTextInputs(inputID, value) {
  dataStorage[inputID] = value;
  localStorage.setItem("settings", JSON.stringify(dataStorage));
}

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

// save radio data to local storage
function storeRadioInputs(radioID, value) {
  Object.keys(dataStorage).forEach((key) => {
    if (key.startsWith("tip")) {
      delete dataStorage[key];
    }
  });

  dataStorage[radioID] = value;
  localStorage.setItem("settings", JSON.stringify(dataStorage));
}

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

// switch between radio and custom input for tip %
function switchRadioAndInput(input) {
  const inputRadioChecked = document.querySelector('[name="tip"]:checked');
  const inputCustomTip = document.getElementById("tip-custom");

  if (input.id === "tip-custom" && inputRadioChecked) {
    inputRadioChecked.checked = false;
  }

  if (input.id !== "tip-custom") {
    inputCustomTip.value = "";
  }
}

// initialize listeners for inputs (to get values)
function initCountListeners() {
  inputBill.addEventListener("input", updateValues);
  inputPeople.addEventListener("input", updateValues);
  inputCustomTip.addEventListener("input", updateValues);
  inputsRadioTip.forEach((input) =>
    input.addEventListener("change", updateValues)
  );
}

// take values from inputs and put into 'values' object
function updateValues() {
  const inputRadioTip = document.querySelector('[name="tip"]:checked');
  values.bill = inputBill.value;
  values.people = inputPeople.value;
  values.tip = inputRadioTip ? inputRadioTip.value : inputCustomTip.value;

  countTipAndTotal();
}

function countTipAndTotal() {
  let bill = Number(values.bill) || 0;
  let tip = Number(values.tip) || 0;
  let people = Number(values.people) || 0;

  if (bill > 0 && tip > 0 && people > 0) {
    let tipAmount = (bill * tip) / 100 / people;
    let totalAmount = bill / people + tipAmount;

    resultTipAmount.textContent = tipAmount;
    resultTotal.textContent = totalAmount;
  } else {
    console.log("Type all data");
    resultTipAmount.textContent = "-";
  }
}
