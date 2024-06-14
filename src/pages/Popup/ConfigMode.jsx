import React, { useState, useEffect, useCallback, useRef } from 'react';

const ConfigMode = ({
  prevBaseCurrency,
  prevSelectedCurrencies,
  backCallback,
  onSave,
  prevDefaultCurrency,
}) => {
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [baseCurrency, setBaseCurrency] = useState(prevBaseCurrency);
  const [currencyList, setCurrencyList] = useState(prevSelectedCurrencies);
  const [defaultCurrency, setDefaultCurrency] = useState(prevDefaultCurrency);

  const baseSelectRef = useRef();
  const listSelectRef = useRef();
  useEffect(() => {
    chrome.runtime.sendMessage(
      { action: 'getAvailableCurrencies' },
      (response) => {
        const entries = Object.entries(response)
          .reduce((acc, [currency, name]) => {
            return [...acc, [currency, name]];
          }, [])
          .filter(([currency]) => !currencyList.includes(currency));
        setAvailableCurrencies(entries);
      }
    );
  }, [currencyList]);

  const addCurrency = useCallback(() => {
    const currency = listSelectRef.current.value;
    setCurrencyList([...currencyList, currency]);
    setAvailableCurrencies(availableCurrencies.filter(([c]) => c !== currency));
  }, [currencyList, setAvailableCurrencies, availableCurrencies]);

  const onChangeBaseCurrency = useCallback(
    (ev) => {
      const value = ev.target.value;
      setBaseCurrency(value);
    },
    [setBaseCurrency]
  );

  const handleSave = useCallback(() => {
    onSave({
      currencyList,
      baseCurrency,
      defaultCurrency,
    });
  }, [currencyList, baseCurrency, onSave, defaultCurrency]);

  const removeCurrency = useCallback(
    (currency) => {
      setCurrencyList(currencyList.filter((c) => c !== currency));
    },
    [currencyList]
  );

  const handleDefaultCurrency = useCallback((currency) => {
    setDefaultCurrency(currency);
  }, []);
  return (
    <div>
      <h1>Configuração</h1>
      {availableCurrencies?.length < 1 && <p>Loading...</p>}
      {availableCurrencies?.length > 0 && (
        <>
          <p>Selecione a moeda base</p>
          <select
            ref={baseSelectRef}
            value={baseCurrency}
            onChange={onChangeBaseCurrency}
          >
            {availableCurrencies.map(([currency, name]) => (
              <option key={currency} value={currency}>
                {currency} - {name}
              </option>
            ))}
          </select>
        </>
      )}

      <h2>Moedas adicionadas</h2>
      <ul>
        {currencyList.map((currency) => (
          <li key={currency}>
            {currency}
            <button onClick={() => removeCurrency(currency)}>Remove</button>
            {defaultCurrency !== currency && (
              <button onClick={() => handleDefaultCurrency(currency)}>
                Set as default
              </button>
            )}
          </li>
        ))}
      </ul>
      {availableCurrencies?.length > 0 && (
        <>
          <p>Selecione a moeda para adicionar</p>
          <select ref={listSelectRef}>
            {availableCurrencies.map(([currency, name]) => (
              <option key={currency} value={currency}>
                {currency} - {name}
              </option>
            ))}
          </select>
          <button onClick={addCurrency}>Adicionar</button>
        </>
      )}
      <button onClick={handleSave}>Salvar</button>
      <button onClick={backCallback}>Voltar</button>
    </div>
  );
};

export default ConfigMode;
