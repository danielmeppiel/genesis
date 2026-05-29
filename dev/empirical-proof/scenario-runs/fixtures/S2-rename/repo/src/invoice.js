'use strict';
const { calculateTotal } = require('./math');

function generateInvoice(order) {
  const lineTotal = calculateTotal(order.items);
  return {
    invoiceId: 'INV-' + order.userId + '-' + Date.now(),
    lineTotal,
    tax: lineTotal * 0.1,
    grandTotal: lineTotal * 1.1
  };
}

function previewInvoice(items) {
  return { preview: true, lineTotal: calculateTotal(items) };
}

module.exports = { generateInvoice, previewInvoice };
