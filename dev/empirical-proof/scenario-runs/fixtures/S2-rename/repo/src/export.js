'use strict';
const { calculateTotal } = require('./math');

function toCSVRow(order) {
  const total = calculateTotal(order.items);
  return [order.id, order.userId, total].join(',');
}

function toJSON(orders) {
  return orders.map(o => ({ id: o.id, total: calculateTotal(o.items) }));
}

module.exports = { toCSVRow, toJSON };
