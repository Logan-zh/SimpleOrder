import React, { useEffect, useState } from 'react';
import {
  getAllMenu, createMenuItem, updateMenuItem, deleteMenuItem, MenuItem,
} from '../api';
import './AdminMenu.css';

const DEFAULT_FORM = { name: '', description: '', price: '', imageUrl: '', isAvailable: true };

const AdminMenu: React.FC = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMenu = async () => {
    const res = await getAllMenu();
    setMenu(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchMenu(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((f) => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      imageUrl: form.imageUrl || undefined,
      isAvailable: form.isAvailable,
    };
    if (editingId !== null) {
      await updateMenuItem(editingId, payload);
    } else {
      await createMenuItem(payload);
    }
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setShowModal(false);
    fetchMenu();
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(DEFAULT_FORM);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('確定要刪除此菜色？')) {
      await deleteMenuItem(id);
      fetchMenu();
    }
  };

  const handleToggle = async (item: MenuItem) => {
    await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
    fetchMenu();
  };

  return (
    <div className="admin-menu">
      <div className="admin-menu-header">
        <h1>後台 — 菜單管理</h1>
        <button className="open-modal-btn" onClick={() => { setForm(DEFAULT_FORM); setEditingId(null); setShowModal(true); }}>
          ＋ 新增菜色
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId !== null ? '編輯菜色' : '新增菜色'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>名稱 *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="例：招牌牛肉麵" autoFocus />
              </div>
              <div className="form-group">
                <label>說明</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="選填" />
              </div>
              <div className="form-group">
                <label>售價 (NT$) *</label>
                <input name="price" type="number" min="0" step="1" value={form.price} onChange={handleChange} required placeholder="例：120" />
              </div>
              <div className="form-group">
                <label>圖片 URL</label>
                <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="form-group form-check">
                <input type="checkbox" id="isAvailable" name="isAvailable" checked={form.isAvailable} onChange={handleChange} />
                <label htmlFor="isAvailable">上架顯示</label>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">{editingId !== null ? '儲存變更' : '新增'}</button>
                <button type="button" className="cancel-edit-btn" onClick={handleCloseModal}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h2>全部菜色</h2>
      {loading ? (
        <p>載入中...</p>
      ) : (
        <div className="menu-list">
          {menu.map((item) => (
            <div className={`menu-row ${!item.isAvailable ? 'unavailable' : ''}`} key={item.id}>
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="row-img" />}
              <div className="row-info">
                <strong>{item.name}</strong>
                {item.description && <span className="row-desc">{item.description}</span>}
                <span className="row-price">NT$ {Number(item.price).toFixed(0)}</span>
              </div>
              <div className="row-actions">
                <button
                  className={`toggle-btn ${item.isAvailable ? 'on' : 'off'}`}
                  onClick={() => handleToggle(item)}
                >
                  {item.isAvailable ? '上架中' : '已下架'}
                </button>
                <button className="edit-btn" onClick={() => handleEdit(item)}>編輯</button>
                <button className="delete-btn" onClick={() => handleDelete(item.id)}>刪除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
