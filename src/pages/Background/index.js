import { Storage } from '../Storage';

const TIMER_REPEAT_EVERY_MINUTES = 5;
const TIMER_FIRST_DELAY_MINUTES = 5;

const BASE_URL = 'https://economia.awesomeapi.com.br/json';

const storage = new Storage();

const getData = async (url) => {
  return fetch(url)
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
      return error;
    });
};

const updateCoin = async (coin) => {
  const buyPrice = Math.round(coin.bid * 100) / 100;
  chrome.action.setBadgeText({ text: buyPrice.toString() });
};

const getAvailableCurrencies = async () => {
  return getData(`${BASE_URL}/available/uniq`);
};

const fetchAndUpdateCurrencies = async () => {
  const currencies = await getAvailableCurrencies();
  await storage.set('availableCurrencies', currencies);
  return currencies;
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAvailableCurrencies') {
    storage
      .get('availableCurrencies')
      .then((availableCurrencies) => {
        if (availableCurrencies?.length > 0) {
          return availableCurrencies;
        }
        return fetchAndUpdateCurrencies();
      })
      .then((availableCurrencies) => {
        return sendResponse(availableCurrencies);
      });
    return true;
  }
  if (request.action === 'savePreferences') {
    storage
      .set('preferences', request.preferences)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error });
      });
    return true;
  }
  if (request.action === 'getPreferences') {
    storage.get('preferences').then((preferences) => {
      let parsedPreferences = preferences;
      if (!parsedPreferences) {
        parsedPreferences = {
          currencyList: ['EUR'],
          baseCurrency: 'BRL',
          defaultCurrency: 'EUR',
        };
      }
      sendResponse(parsedPreferences);
    });
    return true;
  }
  if (request.action === 'updateCurrencies') {
    fetchCurrencies().then((data) => {
      sendResponse(data);
    });
    return true;
  }
});

const fetchCurrencies = async () => {
  const preferences = await storage.get('preferences');
  const {
    baseCurrency = 'BRL',
    defaultCurrency = 'EUR',
    currencyList = [defaultCurrency],
  } = preferences || {};
  const conversions = currencyList.map(
    (currency) => `${currency}-${baseCurrency}`
  );
  const allCurrencies = conversions.join(',');
  const url = `${BASE_URL}/last/${allCurrencies}`;
  const data = await getData(url);

  try {
    await Promise.all([
      updateCoin(data[`${defaultCurrency}${baseCurrency}`]),
      storage.set('currencies', data),
    ]);
    return data;
  } catch (error) {
    console.error('ERROR SETTING TEXT', error);
  }
};

async function startAlarm(name) {
  await chrome.alarms.create(name, {
    delayInMinutes: TIMER_FIRST_DELAY_MINUTES,
    periodInMinutes: TIMER_REPEAT_EVERY_MINUTES,
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'update') {
    fetchCurrencies();
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'install' && details.reason !== 'update') return;
  chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
  chrome.action.setBadgeTextColor({ color: [255, 255, 255, 255] });
  chrome.action.setBadgeText({ text: '...' });
  startAlarm('update');
  fetchCurrencies();
});
