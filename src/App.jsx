import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; 
    background: #09090B; 
    color: #FAFAFA; 
    font-size: 15px; 
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    -webkit-tap-highlight-color: transparent;
  }
  
  /* Mobile-first padding with iPhone notch support */
  .app { 
    max-width: 860px; 
    margin: 0 auto; 
    padding: calc(env(safe-area-inset-top) + 24px) 16px calc(env(safe-area-inset-bottom) + 80px); 
  }
  
  .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
  .brand-dot { width: 10px; height: 10px; border-radius: 50%; background: #FAFAFA; }
  h1 { font-size: 24px; font-weight: 600; color: #FAFAFA; letter-spacing: -.02em; margin-bottom: 4px; }
  .sub { font-size: 14px; color: #A1A1AA; margin-bottom: 24px; }
  
  .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
  .metric { background: #18181B; border: 1px solid #27272A; border-radius: 14px; padding: 16px; }
  .mlabel { font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; color: #A1A1AA; margin-bottom: 8px; }
  .mval { font-size: 22px; font-weight: 600; letter-spacing: -.02em; color: #FAFAFA; }
  .mval.pos { color: #34D399; }
  .mval.neg { color: #F87171; }
  
  .card { background: #09090B; border: 1px solid #27272A; border-radius: 16px; margin-bottom: 24px; overflow: hidden; }
  .card-pad { padding: 20px 16px; }
  
  .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .slabel { font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; color: #A1A1AA; }
  
  .time-tabs { display: flex; gap: 4px; background: #18181B; padding: 4px; border-radius: 8px; border: 1px solid #27272A; }
  .time-tab { padding: 6px 12px; font-size: 13px; font-weight: 500; color: #A1A1AA; background: transparent; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
  .time-tab.on { background: #27272A; color: #FAFAFA; }
  
  .form-row { display: flex; flex-direction: column; gap: 16px; }
  .ff label { display: block; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; color: #A1A1AA; margin-bottom: 8px; }
  
  /* CRITICAL: font-size 16px stops iOS Safari from auto-zooming */
  .ff input { width: 100%; padding: 14px 16px; border: 1px solid #27272A; border-radius: 10px; font-size: 16px; background: #18181B; color: #FAFAFA; -webkit-appearance: none; }
  .ff input:focus { outline: none; border-color: #FAFAFA; }
  .ff input::placeholder { color: #52525B; }
  
  .btn-primary { width: 100%; padding: 14px 20px; background: #FAFAFA; color: #09090B; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 8px; -webkit-appearance: none; }
  .btn-primary:active { opacity: 0.8; }
  .btn-primary:disabled { opacity: .5; }
  
  .tabs { display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid #27272A; padding-bottom: 12px; }
  .tab { flex: 1; padding: 10px; font-size: 14px; font-weight: 600; color: #A1A1AA; background: transparent; border: none; cursor: pointer; border-radius: 8px; }
  .tab.on { background: #18181B; color: #FAFAFA; }
  
  .list-hdr { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #27272A; background: #18181B; }
  .list-hdr h2 { font-size: 15px; font-weight: 600; color: #FAFAFA; }
  .cnt { font-size: 12px; font-weight: 600; background: #27272A; color: #A1A1AA; padding: 4px 10px; border-radius: 20px; }
  
  .row { display: flex; flex-direction: column; gap: 12px; padding: 16px; border-bottom: 1px solid #27272A; }
  .row:last-child { border-bottom: none; }
  .row-top { display: flex; align-items: center; gap: 16px; }
  
  .ico { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; font-weight: 600; }
  .ico.up { background: rgba(52, 211, 153, 0.1); color: #34D399; }
  .ico.dn { background: rgba(248, 113, 113, 0.1); color: #F87171; }
  .ico.pend { background: #18181B; color: #A1A1AA; border: 1px solid #27272A; }
  
  .rinfo { flex: 1; min-width: 0; }
  .rname { font-weight: 600; font-size: 15px; color: #FAFAFA; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
  .rmeta { font-size: 13px; color: #A1A1AA; }
  
  .acts { display: flex; align-items: center; gap: 8px; width: 100%; justify-content: space-between; margin-top: 4px; }
  .acts-right { display: flex; gap: 8px; align-items: center; }
  
  .badge { display: inline-flex; align-items: center; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 20px; }
  .badge.pos { background: rgba(52, 211, 153, 0.1); color: #34D399; }
  .badge.neg { background: rgba(248, 113, 113, 0.1); color: #F87171; }
  
  .btn-sell { padding: 10px 16px; background: #27272A; color: #FAFAFA; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; flex: 1; text-align: center; }
  .btn-del { padding: 10px; background: transparent; color: #52525B; border: none; font-size: 20px; line-height: 1; display: flex; align-items: center; justify-content: center; }
  
  .sell-form { display: flex; gap: 8px; width: 100%; }
  .sinput { flex: 1; padding: 10px 16px; border: 1px solid #27272A; border-radius: 8px; font-size: 16px; background: #18181B; color: #FAFAFA; -webkit-appearance: none; }
  .btn-confirm { padding: 10px 16px; background: #FAFAFA; color: #09090B; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; }
  .btn-ghost { padding: 10px 16px; background: transparent; color: #A1A1AA; border: 1px solid #27272A; border-radius: 8px; font-size: 14px; }
  
  .empty { padding: 60px 20px; text-align: center; color: #A1A1AA; }
  .empty .eico { font-size: 32px; margin-bottom: 16px; opacity: 0.5; }
  .chart-empty { padding: 50px 20px; text-align: center; color: #A1A1AA; font-size: 14px; }

  @media (min-width: 640px) {
    .metrics { grid-template-columns: repeat(4, 1fr); }
    .form-row { flex-direction: row; align-items: flex-end; }
    .btn-primary { width: auto; margin-top: 0; }
    .row { flex-direction: row; align-items: center; justify-content: space-between; }
    .acts { width: auto; margin-top: 0; justify-content: flex-end; }
    .btn-sell { flex: none; }
  }
`;

function parseDate(str) {
  if (!str) return null;
  const [m, d, y] = str.split('/').map(Number);
  return new Date(y, m - 1, d);
}

function startOfWeek(d) {
  const r = new Date(d);
  r.setDate(r.getDate() - r.getDay());
  r.setHours(0, 0, 0, 0);
  return r;
}

function bucketKey(date, horizon) {
  if (horizon === 'W') {
    const s = startOfWeek(date);
    return `${s.getMonth() + 1}/${s.getDate()}/${s.getFullYear()}`;
  }
  if (horizon === 'M') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  return `${date.getFullYear()}`;
}

function bucketLabel(key, horizon) {
  if (horizon === 'W') {
    const [m, d] = key.split('/');
    return `${m}/${d}`;
  }
  if (horizon === 'M') {
    const [y, m] = key.split('-');
    return new Date(+y, +m - 1, 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  }
  return key;
}

export default function App() {
  const [inventory, setInventory] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('resell_tracker_data');
      if (saved) return JSON.parse(saved);
    }
    return []; 
  });

  const [tab, setTab] = useState('active');
  const [horizon, setHorizon] = useState('W');
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [sellingId, setSellingId] = useState(null);
  const [sellPrice, setSellPrice] = useState('');

  useEffect(() => {
    localStorage.setItem('resell_tracker_data', JSON.stringify(inventory));
  }, [inventory]);

  const sold = inventory.filter(i => i.isSold);
  const active = inventory.filter(i => !i.isSold);

  const grossRev = sold.reduce((s, i) => s + i.soldPrice, 0);
  const allCost = inventory.reduce((s, i) => s + i.cost, 0);
  const soldCost = sold.reduce((s, i) => s + i.cost, 0);
  const net = grossRev - soldCost;
  const roi = allCost > 0 ? ((net / allCost) * 100).toFixed(1) : '0.0';

  const fmt = v => '$' + Math.abs(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const chartData = useMemo(() => {
    const soldWithDate = sold
      .map(i => ({ ...i, parsedDate: parseDate(i.dateSold) }))
      .filter(i => i.parsedDate)
      .sort((a, b) => a.parsedDate - b.parsedDate);

    if (!soldWithDate.length) return [];

    const buckets = {};
    for (const item of soldWithDate) {
      const key = bucketKey(item.parsedDate, horizon);
      if (!buckets[key]) buckets[key] = { key, label: bucketLabel(key, horizon), profit: 0 };
      buckets[key].profit += item.soldPrice - item.cost;
    }

    const sorted = Object.values(buckets).sort((a, b) => a.key.localeCompare(b.key));
    let cum = 0;
    return sorted.map(b => {
      cum += b.profit;
      return { label: b.label, cumProfit: parseFloat(cum.toFixed(2)), periodProfit: parseFloat(b.profit.toFixed(2)) };
    });
  }, [inventory, horizon]);

  const addItem = useCallback(() => {
    if (!name.trim() || !cost) return;
    setInventory(prev => [{
      id: Date.now(), name: name.trim(), cost: parseFloat(cost),
      soldPrice: null, isSold: false,
      dateAdded: new Date().toLocaleDateString(), dateSold: null,
    }, ...prev]);
    setName(''); setCost('');
  }, [name, cost]);

  const confirmSell = useCallback((id) => {
    const price = parseFloat(sellPrice);
    if (!price || isNaN(price) || price <= 0) return;
    setInventory(prev => prev.map(item =>
      item.id === id
        ? { ...item, isSold: true, soldPrice: price, dateSold: new Date().toLocaleDateString() }
        : item
    ));
    setSellingId(null); setSellPrice(''); setTab('sold');
  }, [sellPrice]);

  const deleteItem = useCallback((id) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  }, []);

  const items = tab === 'active' ? active : [...sold].reverse();

  const yMin = chartData.length ? Math.min(0, ...chartData.map(d => d.cumProfit)) : 0;
  const yMax = chartData.length ? Math.max(...chartData.map(d => d.cumProfit)) : 100;
  const yPad = Math.ceil((yMax - yMin) * 0.15) || 50;
  const yDomain = [Math.floor(yMin - yPad), Math.ceil(yMax + yPad)];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="brand"><div className="brand-dot" /></div>
        <h1>Resell Tracker</h1>
        <div className="sub">Track your inventory and portfolio margins</div>

        <div className="metrics">
          <div className="metric">
            <div className="mlabel">Spent</div>
            <div className="mval">{fmt(allCost)}</div>
          </div>
          <div className="metric">
            <div className="mlabel">Revenue</div>
            <div className="mval">{fmt(grossRev)}</div>
          </div>
          <div className="metric">
            <div className="mlabel">Profit</div>
            <div className={`mval ${net >= 0 ? 'pos' : 'neg'}`}>{net >= 0 ? '' : '-'}{fmt(net)}</div>
          </div>
          <div className="metric">
            <div className="mlabel">ROI</div>
            <div className={`mval ${parseFloat(roi) >= 0 ? 'pos' : 'neg'}`}>{roi}%</div>
          </div>
        </div>

        <div className="card">
          <div className="card-pad">
            <div className="chart-header">
              <div className="slabel">Profit</div>
              <div className="time-tabs">
                {['W', 'M', 'Y'].map(h => (
                  <button key={h} className={`time-tab ${horizon === h ? 'on' : ''}`} onClick={() => setHorizon(h)}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
            {chartData.length < 1 ? (
              <div className="chart-empty">No sold items yet to chart.</div>
            ) : (
              <div style={{ height: 180, marginLeft: -16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#A1A1AA' }} axisLine={{ stroke: '#27272A' }} tickLine={false} dy={10} />
                    <YAxis domain={yDomain} tickFormatter={v => `$${v}`} tick={{ fontSize: 11, fill: '#A1A1AA' }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip formatter={(v, name) => [`$${v.toFixed(2)}`, name === 'cumProfit' ? 'Cumulative' : 'Period']} labelFormatter={l => `Period: ${l}`} contentStyle={{ border: '1px solid #27272A', borderRadius: 8, fontSize: 12, background: '#18181B', color: '#FAFAFA' }} itemStyle={{ color: '#FAFAFA' }} />
                    <Line type="monotone" dataKey="cumProfit" name="cumProfit" stroke="#FAFAFA" strokeWidth={2} dot={{ r: 4, fill: '#FAFAFA', stroke: '#09090B', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="card card-pad">
          <div className="slabel" style={{ marginBottom: 16 }}>Add new item</div>
          <div className="form-row">
            <div className="ff" style={{ flex: 2 }}>
              <input type="text" placeholder="Item name (e.g. Jordan 1 Bred)" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} />
            </div>
            <div className="ff">
              <input type="number" placeholder="Cost ($0.00)" min="0" value={cost} onChange={e => setCost(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} />
            </div>
            <button className="btn-primary" onClick={addItem} disabled={!name.trim() || !cost}>
              Add Item
            </button>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'active' ? 'on' : ''}`} onClick={() => setTab('active')}>
            Active ({active.length})
          </button>
          <button className={`tab ${tab === 'sold' ? 'on' : ''}`} onClick={() => setTab('sold')}>
            Sold ({sold.length})
          </button>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div className="list-hdr">
            <h2>{tab === 'active' ? 'Inventory' : 'History'}</h2>
            <span className="cnt">{items.length}</span>
          </div>
          {items.length === 0 ? (
            <div className="empty">
              <div className="eico">{tab === 'active' ? '📦' : '🏷️'}</div>
              <p>{tab === 'active' ? 'No active items. Add something above.' : 'Nothing sold yet.'}</p>
            </div>
          ) : items.map(item => {
            const profit = item.isSold ? item.soldPrice - item.cost : null;
            const pct = profit !== null ? ((profit / item.cost) * 100).toFixed(1) : null;
            const isPos = profit === null || profit >= 0;
            const icoClass = item.isSold ? (isPos ? 'up' : 'dn') : 'pend';
            const arrow = item.isSold ? (isPos ? '↗' : '↘') : '◷';
            return (
              <div key={item.id} className="row">
                <div className="row-top">
                  <div className={`ico ${icoClass}`}>{arrow}</div>
                  <div className="rinfo">
                    <div className="rname">{item.name}</div>
                    <div className="rmeta">
                      {item.isSold
                        ? `Cost ${fmt(item.cost)} · Sold ${fmt(item.soldPrice)}`
                        : `Cost ${fmt(item.cost)} · Added ${item.dateAdded}`}
                    </div>
                  </div>
                </div>
                
                <div className="acts">
                  {item.isSold ? (
                    <>
                      <span className={`badge ${profit >= 0 ? 'pos' : 'neg'}`}>
                        {profit >= 0 ? '+' : '-'}{fmt(profit)} ({pct}%)
                      </span>
                      <button className="btn-del" onClick={() => deleteItem(item.id)}>×</button>
                    </>
                  ) : sellingId === item.id ? (
                    <div className="sell-form">
                      <input className="sinput" type="number" placeholder="Sold $" min="0" value={sellPrice} onChange={e => setSellPrice(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmSell(item.id)} autoFocus />
                      <button className="btn-confirm" onClick={() => confirmSell(item.id)}>✓</button>
                      <button className="btn-ghost" onClick={() => { setSellingId(null); setSellPrice(''); }}>✕</button>
                    </div>
                  ) : (
                    <>
                      <button className="btn-sell" onClick={() => { setSellingId(item.id); setSellPrice(''); }}>Mark Sold</button>
                      <button className="btn-del" onClick={() => deleteItem(item.id)}>×</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}