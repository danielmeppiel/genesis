'use strict';
const { calculateTotal } = require('./math');

const TAX_RATES = { US: 0.08, EU: 0.20, CA: 0.13 };

function taxAmount(items, region) {
  const rate = TAX_RATES[region] || 0;
  return calculateTotal(items) * rate;
}

function totalWithTax(items, region) {
  const base = calculateTotal(items);
  return base + base * (TAX_RATES[region] || 0);
}

module.exports = { taxAmount, totalWithTax };
