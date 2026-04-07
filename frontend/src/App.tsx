import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TableSelect from './pages/TableSelect';
import MenuPage from './pages/MenuPage';
import BillPage from './pages/BillPage';
import AdminLayout from './pages/AdminLayout';
import AdminOrders from './pages/AdminOrders';
import AdminMenu from './pages/AdminMenu';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 前台 */}
        <Route path="/" element={<TableSelect />} />
        <Route path="/menu/:tableNumber" element={<MenuPage />} />
        <Route path="/bill/:tableNumber" element={<BillPage />} />

        {/* 後台 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="menu" element={<AdminMenu />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
