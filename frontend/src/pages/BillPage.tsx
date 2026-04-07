import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTableOrders, Order } from '../api';
import './BillPage.css';

const BillPage: React.FC = () => {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const navigate = useNavigate();
  const table = Number(tableNumber);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getTableOrders(table).then((res) => setOrders(res.data));
  }, [table]);

  const activeOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'confirmed'
  );

  const grandTotal = activeOrders.reduce(
    (sum, o) => sum + Number(o.totalAmount),
    0
  );

  const allItems = activeOrders.flatMap((o) => o.items);
  const merged: { name: string; quantity: number; unitPrice: number }[] = [];
  for (const item of allItems) {
    const existing = merged.find((m) => m.name === item.menuItem.name);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      merged.push({
        name: item.menuItem.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      });
    }
  }

  return (
    <div className="bill-page">
      <button className="back-link" onClick={() => navigate(`/menu/${table}`)}>← 返回菜單</button>
      <h1>桌號 {table} — 帳單</h1>
      {merged.length === 0 ? (
        <p className="empty-msg">目前沒有待核銷的訂單</p>
      ) : (
        <table className="bill-table">
          <thead>
            <tr>
              <th>品項</th>
              <th>數量</th>
              <th>單價</th>
              <th>小計</th>
            </tr>
          </thead>
          <tbody>
            {merged.map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>NT$ {item.unitPrice.toFixed(0)}</td>
                <td>NT$ {(item.unitPrice * item.quantity).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="total-label">總金額</td>
              <td className="total-amount">NT$ {grandTotal.toFixed(0)}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export default BillPage;
