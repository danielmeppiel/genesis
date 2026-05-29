'use strict';
const { calculateTotal } = require('./math');

function applyDiscount(items, pct) {
  const base = calculateTotal(items);
  return base * (1 - pct / 100);
}

function bulkDiscount(items) {
  const base = calculateTotal(items);
  if (base > 500) return base * 0.9;
  if (base > 50) return base * 0.95;
  return base;
}

function loyaltyDiscount(items, points) {
  const base = calculateTotal(items);
  return Math.max(0, base - points * 0.01);
}

module.exports = { applyDiscount, bulkDiscount, loyaltyDiscount };
