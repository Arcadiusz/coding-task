const BASE_API_URL =
  "https://currencycalculator-d9d0b-default-rtdb.europe-west1.firebasedatabase.app/";
const CURRENCIES_SYMBOLS = {
  USD: "$",
  EUR: "€",
  PLN: "zł",
  UAH: "₴",
};
const currencyForm = document.getElementById("currency-exchange-form");
const fromCurrencySelect = document.getElementById("from");
const toCurrencySelect = document.getElementById("to");
const exchangeRatesTableContainer = document.querySelector(".exchange-rates");
const errorMsgContainer = document.querySelector(".error-msg");
const currencyPairExchangeRateResult = document.querySelector('.conversion-result');

let selectedCurrencyPairExchangeRate = 0;
let currencyExchangeRates = {};

const main = async () => {
  try {
    const currencies = await fetchAvailableCurrencies();
    createCurrencyOptions(currencies);
    await setupExchangeRates();
  } catch (error) {
    console.error(error);
  }

  currencyForm.addEventListener("submit", handleFormSubmit);
};

const setupExchangeRates = async () => {
  try {
    const fromCurrencyValue = fromCurrencySelect.value;
    const toCurrencyValue = toCurrencySelect.value;

    const data = await fetchCurrencyExchangeRates(fromCurrencyValue);
    selectedCurrencyPairExchangeRate = data[toCurrencyValue];
    currencyExchangeRates = data;
    createExchangeRatesTable(data, fromCurrencyValue);
  } catch (e) {
    console.error(e);
  }
};

const fetchCurrencyExchangeRates = async (currency) => {
  const currencyUrl = `${BASE_API_URL}/${currency.toUpperCase()}.json`;
  const response = await fetch(currencyUrl);
  if (!response.ok) {
    throw Error(
      `something went wrong ${response.statusText} ${response.status}`
    );
  }
  const data = await response.json();
  return data;
};

const fetchAvailableCurrencies = async () => {
  const response = await fetch(`${BASE_API_URL}/currencies.json`);
  if (!response.ok) {
    throw Error(
      `something went wrong ${response.statusText} ${response.status}`
    );
  }
  const data = await response.json();
  if (!data) throw Error("No data available");
  const currencies = data.split(",");
  return currencies;
};

const validateForm = (amount, fromCurrency, toCurrency) => {
  if (amount <= 0) {
    return "Amount must be greater than 0";
  }

  if (fromCurrency === toCurrency) {
    return "Currencies cannot be the same";
  }

  return "";
};

const handleFormSubmit = (event) => {
  event.preventDefault();
  const amount = parseFloat(document.getElementById("amount").value);
  const fromCurrencyValue = fromCurrencySelect.value;
  const toCurrencyValue = toCurrencySelect.value;

  const validationMessage = validateForm(
    amount,
    fromCurrencyValue,
    toCurrencyValue
  );
  if (validationMessage) {
    currencyPairExchangeRateResult.textContent = "";
    errorMsgContainer.textContent = validationMessage;
    return;
  } else {
    errorMsgContainer.textContent = "";
    const result = (amount * selectedCurrencyPairExchangeRate).toFixed(2);
    currencyPairExchangeRateResult.textContent = `${amount} ${CURRENCIES_SYMBOLS[fromCurrencyValue]} ≈ ${result} ${CURRENCIES_SYMBOLS[toCurrencyValue]}`;
  }
};

const createCurrencyOptions = async (currencies) => {
  [fromCurrencySelect, toCurrencySelect].forEach((selectElement, index) => {
    currencies.forEach((currency, idx) => {
      const option = document.createElement("option");
      const isToCurrencySelectElement = index === 1;
      const isSecondOption = idx === 1;
      if (isToCurrencySelectElement && isSecondOption) {
        option.setAttribute("selected", "selected");
      }
      option.value = currency;
      option.textContent = currency;
      selectElement.appendChild(option);
    });
  });

  fromCurrencySelect.addEventListener("change", setupExchangeRates);
  toCurrencySelect.addEventListener("change", (e) => {
    selectedCurrencyPairExchangeRate = currencyExchangeRates[e.target.value];
  });
};

main();

const createExchangeRatesTable = (data, fromWhichCurrency) => {
  const exchangeRatesTable = `
    <table class="exchange-rates-table">
      <thead>
        <tr>
        <th colspan="2">${fromWhichCurrency} exchange rates</th>
        </tr>
      </thead>
      <tbody>
      ${Object.keys(data)
        .map((currency) => {
          return `
          <tr>
              <td>${currency}</td>
              <td>${data[currency].toFixed(2)}</td>
          </tr>
          `;
        })
        .join("")}
      </tbody>
    </table>
  `;
  exchangeRatesTableContainer.innerHTML = exchangeRatesTable;
};
