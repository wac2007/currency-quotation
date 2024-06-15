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
    <div className="block">
      <h1>Configuração</h1>
      <div className="featured">
        {availableCurrencies?.length < 1 && <p>Loading...</p>}
        {availableCurrencies?.length > 0 && (
          <>
            <h2>Selecione a moeda base</h2>
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
      </div>

      <h2>Moedas adicionadas</h2>
      <div className="block currencies">
        <ul>
          {currencyList.map((currency) => (
            <li key={currency}>
              <label>{currency}</label>
              {defaultCurrency !== currency && (
                <button
                  className="secondary"
                  onClick={() => handleDefaultCurrency(currency)}
                >
                  Definir Padrão
                </button>
              )}
              <button onClick={() => removeCurrency(currency)}>Remover</button>
            </li>
          ))}
        </ul>
        {availableCurrencies?.length > 0 && (
          <>
            <h3>Selecione as moedas para adicionar</h3>
            <select ref={listSelectRef}>
              {availableCurrencies.map(([currency, name]) => (
                <option key={currency} value={currency}>
                  {currency} - {name}
                </option>
              ))}
            </select>
            <button className="secondary" onClick={addCurrency}>
              Adicionar
            </button>
          </>
        )}
      </div>
      <div className="button-row">
        <button onClick={handleSave} className="primary">
          Salvar
        </button>
        <button onClick={backCallback}>Voltar</button>
      </div>
    </div>
  );
};

export default ConfigMode;
