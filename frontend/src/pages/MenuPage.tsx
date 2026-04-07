import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAvailableMenu, createOrder, MenuItem } from '../api';
import './MenuPage.css';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

const MenuPage: React.FC = () => {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const navigate = useNavigate();
  const table = Number(tableNumber);

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getAvailableMenu().then((res) => setMenu(res.data));
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map((c) =>
          c.menuItem.id === id ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prev.filter((c) => c.menuItem.id !== id);
    });
  };

  const cartTotal = cart.reduce(
    (sum, c) => sum + Number(c.menuItem.price) * c.quantity,
    0
  );
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    await createOrder({
      tableNumber: table,
      items: cart.map((c) => ({ menuItemId: c.menuItem.id, quantity: c.quantity })),
    });
    setSubmitting(false);
    setSubmitted(true);
    setCart([]);
    setShowCart(false);
  };

  if (submitted) {
    return (
      <div className="submitted-page">
        <h2>訂單已送出！</h2>
        <p>桌號 {table}，請稍候服務人員送餐</p>
        <button onClick={() => setSubmitted(false)} className="back-btn">繼續點餐</button>
        <button onClick={() => navigate(`/bill/${table}`)} className="bill-btn">查看帳單</button>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <header className="menu-header">
        <button className="back-link" onClick={() => navigate('/')}>← 換桌</button>
        <h1>桌號 {table} — 菜單</h1>
        <button className="cart-toggle" onClick={() => setShowCart(!showCart)}>
          購物車 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </header>

      <div className="menu-grid">
        {menu.map((item) => {
          const inCart = cart.find((c) => c.menuItem.id === item.id);
          return (
            <div className="menu-card" key={item.id}>
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="menu-img" />
              )}
              <div className="menu-info">
                <h3>{item.name}</h3>
                {item.description && <p className="desc">{item.description}</p>}
                <span className="price">NT$ {Number(item.price).toFixed(0)}</span>
              </div>
              <div className="menu-actions">
                {inCart ? (
                  <div className="qty-control">
                    <button onClick={() => removeFromCart(item.id)}>−</button>
                    <span>{inCart.quantity}</span>
                    <button onClick={() => addToCart(item)}>＋</button>
                  </div>
                ) : (
                  <button className="add-btn" onClick={() => addToCart(item)}>加入</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCart && (
        <div className="cart-overlay">
          <div className="cart-panel">
            <h2>購物車</h2>
            {cart.length === 0 ? (
              <p>購物車是空的</p>
            ) : (
              <>
                <ul className="cart-list">
                  {cart.map((c) => (
                    <li key={c.menuItem.id} className="cart-item">
                      <span className="cart-name">{c.menuItem.name}</span>
                      <div className="qty-control">
                        <button onClick={() => removeFromCart(c.menuItem.id)}>−</button>
                        <span>{c.quantity}</span>
                        <button onClick={() => addToCart(c.menuItem)}>＋</button>
                      </div>
                      <span className="cart-subtotal">
                        NT$ {(Number(c.menuItem.price) * c.quantity).toFixed(0)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="cart-total">總計：NT$ {cartTotal.toFixed(0)}</div>
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? '送出中...' : '送出訂單'}
                </button>
              </>
            )}
            <button className="close-btn" onClick={() => setShowCart(false)}>關閉</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
