'use strict';

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function computeTax(total, rate) {
  return total * rate;
}

function computeGrandTotal(items, taxRate) {
  const total = calculateTotal(items);
  return total + computeTax(total, taxRate);
}

module.exports = { calculateTotal, computeTax, computeGrandTotal };
