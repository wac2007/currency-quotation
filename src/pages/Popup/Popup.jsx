import React, { useState, useCallback, useEffect } from 'react';
import './Popup.css';
import ConfigMode from './ConfigMode';
import ViewMode from './ViewMode';

const MODES = {
  CONFIG: 'config',
  VIEW: 'view',
};

const Popup = () => {
  const [currentMode, setCurrentMode] = useState(MODES.VIEW);
  const [defaultCurrency, setDefaultCurrency] = useState('EUR');
  const [addedCurrencies, setAddedCurrencies] = useState([defaultCurrency]);
  const [baseCurrency, setBaseCurrency] = useState('BRL');
  const [currencies, setCurrencies] = useState({});

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
  };

  const fetchCurrencies = () => {
    chrome.runtime.sendMessage({ action: 'updateCurrencies' }, (response) => {
      setCurrencies(response);
    });
  };

  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'getPreferences' }, (response) => {
      const { currencyList, baseCurrency, defaultCurrency } = response;
      setAddedCurrencies(currencyList);
      setBaseCurrency(baseCurrency);
      setDefaultCurrency(defaultCurrency);
      fetchCurrencies();
    });
  }, []);

  const handleSave = useCallback(
    ({ currencyList, baseCurrency, defaultCurrency }) => {
      chrome.runtime.sendMessage(
        {
          action: 'savePreferences',
          preferences: {
            currencyList,
            baseCurrency,
            defaultCurrency,
          },
        },
        () => {
          setAddedCurrencies(currencyList);
          setBaseCurrency(baseCurrency);
          setDefaultCurrency(defaultCurrency);
          handleModeChange(MODES.VIEW);
          fetchCurrencies();
        }
      );
    },
    []
  );
  return (
    <div className="App">
      {currentMode === MODES.CONFIG && (
        <ConfigMode
          backCallback={() => handleModeChange(MODES.VIEW)}
          prevBaseCurrency={baseCurrency}
          prevSelectedCurrencies={addedCurrencies}
          prevDefaultCurrency={defaultCurrency}
          onSave={handleSave}
        />
      )}
      {currentMode === MODES.VIEW && (
        <ViewMode
          configCallback={() => handleModeChange(MODES.CONFIG)}
          baseCurrency={baseCurrency}
          addedCurrencies={addedCurrencies}
          defaultCurrency={defaultCurrency}
          currencies={currencies}
        />
      )}
    </div>
  );
};

export default Popup;
