const orderList = document.getElementById('order-list');
const adminMenuList = document.getElementById('admin-menu-list');
const addModal = document.getElementById('add-modal');
const checkoutResult = document.getElementById('checkout-result');

async function loadOrders() {
  const res = await fetch('/api/admin/orders');
  const orders = await res.json();

  orderList.innerHTML = '';

  orders.forEach((order) => {
    const card = document.createElement('article');
    card.className = 'order-card';

    const detail = order.items
      .map((item) => `#${item.menuItemId} x ${item.quantity}`)
      .join(' / ');

    card.innerHTML = `
      <div>批次 #${order.id} | 桌號 ${order.tableNumber}</div>
      <div>${detail}</div>
      <div>金額: $${order.totalAmount} | 狀態: ${order.status}</div>
      <div class="row-end">
        <button class="primary-btn" ${order.status === 'fulfilled' ? 'disabled' : ''}>核銷送餐完畢</button>
      </div>
    `;

    card.querySelector('button').onclick = async () => {
      await fetch(`/api/admin/orders/${order.id}/fulfill`, { method: 'PATCH' });
      loadOrders();
    };

    orderList.appendChild(card);
  });
}

async function loadMenu() {
  const res = await fetch('/api/admin/menu');
  const menu = await res.json();

  adminMenuList.innerHTML = '';
  menu.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'admin-menu-row';
    row.innerHTML = `
      <div><strong>${item.name}</strong> / $${item.price}</div>
      <div class="inline">
        顯示 <input type="checkbox" ${item.visible ? 'checked' : ''} />
      </div>
    `;

    const checkbox = row.querySelector('input');
    checkbox.onchange = async () => {
      await fetch(`/api/admin/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: checkbox.checked }),
      });
    };

    adminMenuList.appendChild(row);
  });
}

document.getElementById('open-add-modal').onclick = () => {
  addModal.classList.add('active');
};

document.getElementById('close-add-modal').onclick = () => {
  addModal.classList.remove('active');
};

document.getElementById('save-menu').onclick = async () => {
  const name = document.getElementById('new-name').value.trim();
  const price = Number(document.getElementById('new-price').value);
  const imageUrl = document.getElementById('new-image').value.trim();
  const visible = document.getElementById('new-visible').checked;

  if (!name || !price || !imageUrl) {
    alert('請完整輸入名稱、價格、圖片網址');
    return;
  }

  const res = await fetch('/api/admin/menu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, imageUrl, visible }),
  });

  if (!res.ok) {
    alert('新增失敗');
    return;
  }

  addModal.classList.remove('active');
  document.getElementById('new-name').value = '';
  document.getElementById('new-price').value = '';
  document.getElementById('new-image').value = '';
  document.getElementById('new-visible').checked = true;

  loadMenu();
};

document.getElementById('checkout-btn').onclick = async () => {
  const tableNumber = document.getElementById('checkout-table').value.trim();
  if (!tableNumber) {
    checkoutResult.textContent = '請先輸入桌號';
    return;
  }

  const res = await fetch(`/api/tables/${tableNumber}/checkout`, { method: 'POST' });
  if (!res.ok) {
    checkoutResult.textContent = '結帳失敗';
    return;
  }

  const result = await res.json();
  checkoutResult.textContent = `${tableNumber} 已核銷，總金額 $${result.bill.totalAmount}`;
  loadOrders();
};

loadOrders();
loadMenu();
