import React from 'react';

const ViewMode = ({
  configCallback,
  addedCurrencies,
  baseCurrency,
  defaultCurrency,
  currencies,
}) => {
  return (
    <div className="block">
      <h1>Cotações</h1>
      <div className="block-flex featured">
        {baseCurrency && (
          <div className="currency">
            Base: <code>{baseCurrency}</code>
          </div>
        )}
        {defaultCurrency && (
          <div className="currency">
            Destaque: <code>{defaultCurrency}</code>
          </div>
        )}
      </div>
      {addedCurrencies?.length > 0 && (
        <>
          <h2>Moedas adicionadas:</h2>
          <div className="block currencies">
            {addedCurrencies.map((currency) => (
              <div className="currency" key={currency}>
                {currency}
                <code>
                  {!!currencies
                    ? Math.round(
                        currencies?.[`${currency}${baseCurrency}`]?.bid * 100
                      ) / 100
                    : 'Indisponível'}
                </code>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="button-row">
        <button onClick={configCallback} className="primary">
          Configurar
        </button>
      </div>
    </div>
  );
};

export default ViewMode;
