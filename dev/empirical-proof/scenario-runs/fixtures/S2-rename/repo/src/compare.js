'use strict';
const { calculateTotal } = require('./math');

function cheaperCart(itemsA, itemsB) {
  const a = calculateTotal(itemsA);
  const b = calculateTotal(itemsB);
  return a <= b ? 'A' : 'B';
}

function savings(itemsA, itemsB) {
  return Math.abs(calculateTotal(itemsA) - calculateTotal(itemsB));
}

module.exports = { cheaperCart, savings };
