import React, { useEffect, useState } from 'react';
import {
  getAllOrders, confirmOrder, completeOrder, completeTable, cancelOrder, Order,
} from '../api';
import './AdminOrders.css';

const STATUS_LABEL: Record<string, string> = {
  pending: '待確認',
  confirmed: '已確認',
  completed: '已核銷',
  cancelled: '已取消',
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const res = await getAllOrders();
    setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const grouped: Record<number, Order[]> = {};
  for (const order of orders) {
    if (!grouped[order.tableNumber]) grouped[order.tableNumber] = [];
    grouped[order.tableNumber].push(order);
  }

  const handleConfirm = async (id: number) => {
    await confirmOrder(id);
    fetchOrders();
  };

  const handleComplete = async (id: number) => {
    await completeOrder(id);
    fetchOrders();
  };

  const handleCompleteTable = async (tableNumber: number) => {
    await completeTable(tableNumber);
    fetchOrders();
  };

  const handleCancel = async (id: number) => {
    await cancelOrder(id);
    fetchOrders();
  };

  if (loading) return <div className="admin-loading">載入中...</div>;

  const activeTables = Object.entries(grouped).filter(([, tableOrders]) =>
    tableOrders.some((o) => o.status === 'pending' || o.status === 'confirmed')
  );

  return (
    <div className="admin-orders">
      <h1>後台 — 訂單管理</h1>
      {activeTables.length === 0 ? (
        <p className="no-orders">目前沒有進行中的訂單</p>
      ) : (
        activeTables.map(([table, tableOrders]) => {
          const activeOrders = tableOrders.filter(
            (o) => o.status === 'pending' || o.status === 'confirmed'
          );
          const confirmedOrders = activeOrders.filter((o) => o.status === 'confirmed');
          const tableTotal = activeOrders.reduce(
            (s, o) => s + Number(o.totalAmount), 0
          );

          return (
            <div className="table-block" key={table}>
              <div className="table-header">
                <h2>桌號 {table}</h2>
                {confirmedOrders.length > 0 && (
                  <button
                    className="complete-table-btn"
                    onClick={() => handleCompleteTable(Number(table))}
                  >
                    核銷整桌 (NT$ {tableTotal.toFixed(0)})
                  </button>
                )}
              </div>
              {activeOrders.map((order) => (
                <div className="order-card" key={order.id}>
                  <div className="order-meta">
                    <span>訂單 #{order.id}</span>
                    <span className={`status status-${order.status}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                    <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <ul className="order-items">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.menuItem.name} × {item.quantity} —
                        NT$ {(Number(item.unitPrice) * item.quantity).toFixed(0)}
                      </li>
                    ))}
                  </ul>
                  <div className="order-footer">
                    <span className="order-total">NT$ {Number(order.totalAmount).toFixed(0)}</span>
                    <div className="order-actions">
                      {order.status === 'pending' && (
                        <>
                          <button onClick={() => handleConfirm(order.id)}>確認送餐</button>
                          <button className="cancel-btn" onClick={() => handleCancel(order.id)}>取消</button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <button onClick={() => handleComplete(order.id)}>核銷此單</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })
      )}

      <h2 className="history-title">歷史訂單</h2>
      <div className="history-list">
        {orders
          .filter((o) => o.status === 'completed' || o.status === 'cancelled')
          .map((order) => (
            <div className="history-card" key={order.id}>
              <span>桌 {order.tableNumber} 訂單 #{order.id}</span>
              <span className={`status status-${order.status}`}>{STATUS_LABEL[order.status]}</span>
              <span>NT$ {Number(order.totalAmount).toFixed(0)}</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AdminOrders;
