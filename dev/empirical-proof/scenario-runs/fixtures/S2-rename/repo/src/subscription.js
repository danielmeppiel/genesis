'use strict';
const { calculateTotal } = require('./math');

function monthlyCharge(planItems) {
  return calculateTotal(planItems);
}

function annualCharge(planItems) {
  return calculateTotal(planItems) * 12 * 0.85;
}

function upgradePreview(currentItems, newItems) {
  const current = calculateTotal(currentItems);
  const next = calculateTotal(newItems);
  return { current, next, delta: next - current };
}

module.exports = { monthlyCharge, annualCharge, upgradePreview };
