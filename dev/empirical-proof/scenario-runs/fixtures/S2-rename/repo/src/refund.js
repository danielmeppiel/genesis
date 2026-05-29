'use strict';
const { calculateTotal } = require('./math');

function fullRefund(order) {
  return { refundAmount: calculateTotal(order.items), reason: 'full' };
}

function partialRefund(order, returnedItems) {
  return { refundAmount: calculateTotal(returnedItems), reason: 'partial' };
}

module.exports = { fullRefund, partialRefund };
