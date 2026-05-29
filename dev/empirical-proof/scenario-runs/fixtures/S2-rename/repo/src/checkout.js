'use strict';
const { calculateTotal } = require('./math');
const { createOrder } = require('./order');

function checkout(cart, userId) {
  const items = cart.items;
  const total = calculateTotal(items);
  if (total <= 0) throw new Error('Cart is empty');
  return createOrder(items, userId);
}

function quickCheckout(items, userId) {
  const total = calculateTotal(items);
  return { userId, total, items };
}

module.exports = { checkout, quickCheckout };
