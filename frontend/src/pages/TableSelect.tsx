import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TableSelect.css';

const TABLES = Array.from({ length: 10 }, (_, i) => i + 1);

const TableSelect: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleConfirm = () => {
    if (selected) {
      navigate(`/menu/${selected}`);
    }
  };

  return (
    <div className="table-select-page">
      <h1>SimplyOrder 點餐系統</h1>
      <h2>請選擇桌號</h2>
      <div className="table-grid">
        {TABLES.map((t) => (
          <button
            key={t}
            className={`table-btn${selected === t ? ' active' : ''}`}
            onClick={() => setSelected(t)}
          >
            桌 {t}
          </button>
        ))}
      </div>
      <button
        className="confirm-btn"
        disabled={!selected}
        onClick={handleConfirm}
      >
        確認入座
      </button>
    </div>
  );
};

export default TableSelect;
