'use strict';
const { calculateTotal } = require('./math');

function priceCheck(items, budget) {
  const total = calculateTotal(items);
  return { total, withinBudget: total <= budget, overage: Math.max(0, total - budget) };
}

function estimateShipping(items) {
  const itemTotal = calculateTotal(items);
  if (itemTotal > 50) return 0;
  return 9.99;
}

module.exports = { priceCheck, estimateShipping };
