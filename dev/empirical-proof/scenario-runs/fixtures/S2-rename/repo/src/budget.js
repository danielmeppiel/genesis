'use strict';
const { calculateTotal } = require('./math');

function budgetRemaining(items, limit) {
  return limit - calculateTotal(items);
}

function overspend(items, limit) {
  const total = calculateTotal(items);
  return total > limit ? total - limit : 0;
}

module.exports = { budgetRemaining, overspend };
