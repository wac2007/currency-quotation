const TIMER_REPEAT_EVERY_MINUTES = 5;
const TIMER_FIRST_DELAY_MINUTES = 5;

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

const init = async () => {
  const data = await getData(
    'https://economia.awesomeapi.com.br/json/last/EUR-BRL'
  );

  try {
    await updateCoin(data.EURBRL);
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
    init();
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'install' && details.reason !== 'update') return;
  chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
  chrome.action.setBadgeTextColor({ color: [255, 255, 255, 255] });
  chrome.action.setBadgeText({ text: '...' });
  startAlarm('update');
  init();
});
