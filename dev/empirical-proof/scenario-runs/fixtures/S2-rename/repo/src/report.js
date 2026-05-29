'use strict';
const { calculateTotal } = require('./math');

function dailyReport(orders) {
  return orders.map(o => ({ orderId: o.id, total: calculateTotal(o.items) }));
}

function monthlySummary(orderGroups) {
  return orderGroups.map(g => ({
    month: g.month,
    orders: g.orders.length,
    revenue: g.orders.reduce((s, o) => s + calculateTotal(o.items), 0)
  }));
}

module.exports = { dailyReport, monthlySummary };
