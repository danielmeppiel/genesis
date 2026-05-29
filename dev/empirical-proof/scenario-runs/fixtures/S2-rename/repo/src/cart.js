'use strict';
const { calculateTotal } = require('./math');

class Cart {
  constructor() { this.items = []; }
  add(item) { this.items.push(item); }
  remove(id) { this.items = this.items.filter(i => i.id !== id); }
  total() { return calculateTotal(this.items); }
  summary() {
    return { items: this.items, total: calculateTotal(this.items) };
  }
}

module.exports = Cart;
