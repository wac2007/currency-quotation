import React from 'react';

const ViewMode = ({
  configCallback,
  addedCurrencies,
  baseCurrency,
  defaultCurrency,
  currencies,
}) => {
  return (
    <div>
      <h1>Visualizando moedas</h1>
      {baseCurrency && <p>Moeda base: {baseCurrency}</p>}
      {defaultCurrency && <p>Moeda em Destaque: {defaultCurrency}</p>}
      {addedCurrencies?.length > 0 && (
        <>
          <p>Moedas adicionadas:</p>
          {addedCurrencies.map((currency) => (
            <p key={currency}>
              {currency} =>{' '}
              {!!currencies
                ? Math.round(
                    currencies?.[`${currency}${baseCurrency}`]?.bid * 100
                  ) / 100
                : 'Indisponível'}
            </p>
          ))}
        </>
      )}
      <button onClick={configCallback}>Config</button>
    </div>
  );
};

export default ViewMode;
