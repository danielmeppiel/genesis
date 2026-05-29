'use strict';
const { calculateTotal } = require('./math');

function averageOrderValue(orders) {
  if (!orders.length) return 0;
  const totals = orders.map(o => calculateTotal(o.items));
  return totals.reduce((s, t) => s + t, 0) / totals.length;
}

function topOrders(orders, n) {
  return orders
    .map(o => ({ order: o, total: calculateTotal(o.items) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, n);
}

module.exports = { averageOrderValue, topOrders };
