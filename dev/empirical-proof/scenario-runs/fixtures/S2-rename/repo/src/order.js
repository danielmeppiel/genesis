'use strict';
const { calculateTotal } = require('./math');

function createOrder(cartItems, userId) {
  const total = calculateTotal(cartItems);
  return { userId, items: cartItems, total, status: 'pending', createdAt: Date.now() };
}

function updateOrder(order, newItems) {
  return Object.assign({}, order, {
    items: newItems,
    total: calculateTotal(newItems),
    updatedAt: Date.now()
  });
}

module.exports = { createOrder, updateOrder };
