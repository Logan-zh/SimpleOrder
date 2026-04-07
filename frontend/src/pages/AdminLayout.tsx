import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <span className="admin-logo">SimplyOrder 後台</span>
        <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>訂單管理</NavLink>
        <NavLink to="/admin/menu" className={({ isActive }) => isActive ? 'active' : ''}>菜單管理</NavLink>
        <NavLink to="/" className="">前台</NavLink>
      </nav>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
