export class Storage {
  cache = {
    // selectedCurrencies: [],
    // mainCurrency: 'BRL',
    // availableCurrencies: {},
  };

  constructor() {
    this.storage = chrome.storage.local;
  }

  async get(key) {
    return new Promise((resolve) => {
      if (this.cache[key]) {
        return resolve(this.cache[key]);
      }
      this.storage.get(key, (data) => {
        resolve(data[key]);
      });
    });
  }

  async set(key, value) {
    return new Promise((resolve) => {
      this.storage.set({ [key]: value }, () => {
        this.cache[key] = value;
        resolve();
      });
    });
  }
}
