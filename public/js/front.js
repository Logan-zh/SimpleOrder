const menuList = document.getElementById('menu-list');
const cartList = document.getElementById('cart-list');
const billList = document.getElementById('bill-list');
const cartTotal = document.getElementById('cart-total');
const billTotal = document.getElementById('bill-total');
const tableModal = document.getElementById('table-modal');
const tableGrid = document.getElementById('table-grid');
const tableLabel = document.getElementById('table-label');

const cart = new Map();
let menu = [];
let tableNumber = '';

function renderTables() {
  tableGrid.innerHTML = '';
  ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'].forEach((table) => {
    const btn = document.createElement('button');
    btn.className = 'ghost-btn';
    btn.textContent = table;
    btn.onclick = () => {
      tableNumber = table;
      tableLabel.textContent = `目前桌號: ${table}`;
      tableModal.classList.remove('active');
      loadBill();
    };
    tableGrid.appendChild(btn);
  });
}

function renderMenu() {
  menuList.innerHTML = '';
  menu.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'menu-card';
    card.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}" />
      <div class="body">
        <h3>${item.name}</h3>
        <div>$${item.price}</div>
        <button class="primary-btn">加入購物車</button>
      </div>
    `;
    card.querySelector('button').onclick = () => {
      const existing = cart.get(item.id) || { ...item, quantity: 0 };
      existing.quantity += 1;
      cart.set(item.id, existing);
      renderCart();
    };
    menuList.appendChild(card);
  });
}

function renderCart() {
  cartList.innerHTML = '';
  let total = 0;

  Array.from(cart.values()).forEach((item) => {
    total += item.price * item.quantity;
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `${item.name} x ${item.quantity} = $${item.price * item.quantity}`;
    cartList.appendChild(row);
  });

  cartTotal.textContent = `總金額: $${total}`;
}

async function loadMenu() {
  const res = await fetch('/api/menu');
  menu = await res.json();
  renderMenu();
}

async function loadBill() {
  if (!tableNumber) {
    return;
  }

  const res = await fetch(`/api/tables/${tableNumber}/bill`);
  const bill = await res.json();

  billList.innerHTML = '';
  bill.items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.textContent = `${item.name} x ${item.quantity} = $${item.subtotal}`;
    billList.appendChild(row);
  });

  billTotal.textContent = `總項目: ${bill.totalQuantity} / 總金額: $${bill.totalAmount}`;
}

document.getElementById('submit-order').onclick = async () => {
  if (!tableNumber) {
    alert('請先選擇桌號');
    return;
  }
  if (cart.size === 0) {
    alert('購物車是空的');
    return;
  }

  const items = Array.from(cart.values()).map((item) => ({
    menuItemId: item.id,
    quantity: item.quantity,
  }));

  const res = await fetch('/api/orders/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber, items }),
  });

  if (!res.ok) {
    alert('送單失敗');
    return;
  }

  cart.clear();
  renderCart();
  await loadBill();
};

document.getElementById('change-table').onclick = () => {
  tableModal.classList.add('active');
};

renderTables();
loadMenu();
