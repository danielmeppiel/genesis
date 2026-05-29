'use strict';
const { calculateTotal } = require('./math');

function formatTotal(items) {
  return '$' + calculateTotal(items).toFixed(2);
}

function isExpensive(items, threshold) {
  return calculateTotal(items) > threshold;
}

module.exports = { formatTotal, isExpensive };
