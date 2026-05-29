'use strict';
const { calculateTotal, computeTax, computeGrandTotal } = require('../src/math');
const Cart = require('../src/cart');
const { createOrder, updateOrder } = require('../src/order');
const { generateInvoice, previewInvoice } = require('../src/invoice');
const { applyDiscount, bulkDiscount, loyaltyDiscount } = require('../src/discount');
const { dailyReport, monthlySummary } = require('../src/report');
const { checkout, quickCheckout } = require('../src/checkout');
const { priceCheck, estimateShipping } = require('../src/pricing');
const { monthlyCharge, annualCharge, upgradePreview } = require('../src/subscription');
const { averageOrderValue, topOrders } = require('../src/analytics');
const { toCSVRow, toJSON } = require('../src/export');
const { taxAmount, totalWithTax } = require('../src/tax');
const { fullRefund, partialRefund } = require('../src/refund');
const { orderConfirmation, lowStockAlert } = require('../src/notification');
const { budgetRemaining, overspend } = require('../src/budget');
const { wishlistValue, affordableItems } = require('../src/wishlist');
const { cheaperCart, savings } = require('../src/compare');
const { formatTotal, isExpensive } = require('../src/utils');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log('  PASS:', msg);
    passed++;
  } else {
    console.error('  FAIL:', msg);
    failed++;
  }
}

const ITEMS = [
  { id: 1, price: 10, qty: 2 },
  { id: 2, price: 5,  qty: 4 },
  { id: 3, price: 50, qty: 1 }
];
// 10*2 + 5*4 + 50*1 = 20 + 20 + 50 = 90

console.log('--- math ---');
assert(calculateTotal(ITEMS) === 90, 'calculateTotal basic');
assert(computeTax(90, 0.1) === 9, 'computeTax');
assert(computeGrandTotal(ITEMS, 0.1) === 99, 'computeGrandTotal');

console.log('--- cart ---');
const cart = new Cart();
ITEMS.forEach(i => cart.add(i));
assert(cart.total() === 90, 'Cart.total');
assert(cart.summary().total === 90, 'Cart.summary');

console.log('--- order ---');
const order = createOrder(ITEMS, 'u1');
assert(order.total === 90, 'createOrder total');
const updated = updateOrder(order, [{ id: 1, price: 10, qty: 1 }]);
assert(updated.total === 10, 'updateOrder total');

console.log('--- invoice ---');
const inv = generateInvoice(order);
assert(inv.lineTotal === 90, 'generateInvoice lineTotal');
assert(previewInvoice(ITEMS).lineTotal === 90, 'previewInvoice lineTotal');

console.log('--- discount ---');
assert(applyDiscount(ITEMS, 10) === 81, 'applyDiscount 10%');
assert(bulkDiscount(ITEMS) === 85.5, 'bulkDiscount >50');
assert(loyaltyDiscount(ITEMS, 1000) === 80, 'loyaltyDiscount');

console.log('--- report ---');
const orders = [{ id: 'o1', items: ITEMS }];
assert(dailyReport(orders)[0].total === 90, 'dailyReport');
const groups = [{ month: '2024-01', orders: orders }];
assert(monthlySummary(groups)[0].revenue === 90, 'monthlySummary');

console.log('--- checkout ---');
const checkoutCart = new Cart();
ITEMS.forEach(i => checkoutCart.add(i));
const co = checkout(checkoutCart, 'u2');
assert(co.total === 90, 'checkout total');
assert(quickCheckout(ITEMS, 'u3').total === 90, 'quickCheckout total');

console.log('--- pricing ---');
assert(priceCheck(ITEMS, 100).total === 90, 'priceCheck total');
assert(priceCheck(ITEMS, 100).withinBudget === true, 'priceCheck withinBudget');
assert(estimateShipping(ITEMS) === 0, 'estimateShipping free');

console.log('--- subscription ---');
assert(monthlyCharge(ITEMS) === 90, 'monthlyCharge');
assert(annualCharge(ITEMS) === 90 * 12 * 0.85, 'annualCharge');
const up = upgradePreview([{ id: 1, price: 10, qty: 1 }], ITEMS);
assert(up.current === 10, 'upgradePreview current');
assert(up.next === 90, 'upgradePreview next');

console.log('--- analytics ---');
assert(averageOrderValue(orders) === 90, 'averageOrderValue');
assert(topOrders(orders, 1)[0].total === 90, 'topOrders');

console.log('--- export ---');
const rowOrder = { id: 'o1', userId: 'u1', items: ITEMS };
assert(toCSVRow(rowOrder).includes('90'), 'toCSVRow');
assert(toJSON([rowOrder])[0].total === 90, 'toJSON');

console.log('--- tax ---');
assert(taxAmount(ITEMS, 'US') === 7.2, 'taxAmount US');
assert(totalWithTax(ITEMS, 'US') === 97.2, 'totalWithTax US');

console.log('--- refund ---');
const refundOrder = { items: ITEMS };
assert(fullRefund(refundOrder).refundAmount === 90, 'fullRefund');
assert(partialRefund(refundOrder, [{ id: 1, price: 10, qty: 1 }]).refundAmount === 10, 'partialRefund');

console.log('--- notification ---');
assert(orderConfirmation({ items: ITEMS }).includes('90.00'), 'orderConfirmation');
assert(lowStockAlert(ITEMS).includes('90.00'), 'lowStockAlert');

console.log('--- budget ---');
assert(budgetRemaining(ITEMS, 100) === 10, 'budgetRemaining');
assert(overspend(ITEMS, 80) === 10, 'overspend');

console.log('--- wishlist ---');
assert(wishlistValue(ITEMS) === 90, 'wishlistValue');
const cheap = affordableItems(ITEMS, 20);
assert(cheap.length === 2, 'affordableItems count');

console.log('--- compare ---');
const cheapItems = [{ id: 9, price: 5, qty: 1 }];
assert(cheaperCart(cheapItems, ITEMS) === 'A', 'cheaperCart');
assert(savings(cheapItems, ITEMS) === 85, 'savings');

console.log('--- utils ---');
assert(formatTotal(ITEMS) === '$90.00', 'formatTotal');
assert(isExpensive(ITEMS, 50) === true, 'isExpensive');

console.log('');
console.log('Results:', passed, 'passed,', failed, 'failed');
if (failed > 0) {
  console.error('TEST SUITE FAILED');
  process.exit(1);
} else {
  console.log('TEST SUITE PASSED');
  process.exit(0);
}
