'use strict';
const { calculateTotal } = require('./math');

function wishlistValue(items) {
  return calculateTotal(items);
}

function affordableItems(items, budget) {
  return items.filter(item => calculateTotal([item]) <= budget);
}

module.exports = { wishlistValue, affordableItems };
