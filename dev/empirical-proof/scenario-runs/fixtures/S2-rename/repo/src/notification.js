'use strict';
const { calculateTotal } = require('./math');

function orderConfirmation(order) {
  return 'Order confirmed. Total: $' + calculateTotal(order.items).toFixed(2);
}

function lowStockAlert(items) {
  return 'Stock alert for items totalling $' + calculateTotal(items).toFixed(2);
}

module.exports = { orderConfirmation, lowStockAlert };
