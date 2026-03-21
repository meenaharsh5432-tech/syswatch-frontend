import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSSE } from '../hooks/useSSE.js';
import MetricChart from '../components/MetricChart.jsx';
import LogStream from '../components/LogStream.jsx';
import ContainerList from '../components/ContainerList.jsx';
import AIPanel from '../components/AIPanel.jsx';
import AgentList from '../components/AgentList.jsx';
import AddAgentModal from '../components/AddAgentModal.jsx';

function useMetricHistory(metrics, extractFn, maxPoints = 60) {
  const historyRef = useRef([]);
  const [history, setHistory] = useState([]);
  const fnRef = useRef(extractFn);

  useEffect(() => {
    if (!metrics) return;
    const value = fnRef.current(metrics);
    if (value == null) return;
    historyRef.current = [
      ...historyRef.current,
      { value, label: new Date(metrics.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) }
    ].slice(-maxPoints);
    setHistory([...historyRef.current]);
  }, [metrics]);

  return history;
}

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}


export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, getToken } = useAuth();
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [agentRefreshKey, setAgentRefreshKey] = useState(0);
  const [showMemInfo, setShowMemInfo] = useState(false);
  const clock = useClock();

  const { metrics, containers, logs, connected } = useSSE(selectedAgentId);

  const cpuHistory   = useMetricHistory(metrics, m => m.cpu);
  const memHistory   = useMetricHistory(metrics, m => m.memory?.usedPercent);
  const diskHistory  = useMetricHistory(metrics, m => m.disk?.usePct);
  const netRxHistory = useMetricHistory(metrics, m => m.network?.rxMbps);
  const netTxHistory = useMetricHistory(metrics, m => m.network?.txMbps);

  const memGB = metrics
    ? `${(metrics.memory?.used / 1024 / 1024 / 1024).toFixed(1)} / ${(metrics.memory?.total / 1024 / 1024 / 1024).toFixed(1)} GB`
    : '-- GB';
  const physicalGB = metrics ? (metrics.memory?.total / 1024 / 1024 / 1024).toFixed(1) : null;
  const pageFileGB = metrics ? (metrics.memory?.pageFile / 1024 / 1024 / 1024).toFixed(1) : null;

  return (
    <div style={s.app} className="dash-app">
      {/* TOP BAR */}
      <div style={s.topBar} className="dash-topbar">
        <div style={s.brand}>
          <span style={{ color: '#58a6ff', fontSize: 20 }}>⬡</span>
          <span style={s.brandName}>SysWatch AI</span>
        </div>

        <div style={s.topCenter} className="dash-topcenter">
          {[
            { label: 'CPU', value: `${metrics?.cpu?.toFixed(1) ?? '--'}%` },
            { label: 'MEM', value: `${metrics?.memory?.usedPercent?.toFixed(1) ?? '--'}%` },
            { label: 'DISK', value: `${metrics?.disk?.usePct?.toFixed(1) ?? '--'}%` }
          ].map(({ label, value }) => (
            <div key={label} style={s.topStat}>
              <span style={s.topStatLabel}>{label}</span>
              <span style={s.topStatValue}>{value}</span>
            </div>
          ))}
        </div>

        <div style={s.topRight} className="dash-topright">
          <span style={s.clock} className="dash-clock">{clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
          <div style={{ ...s.statusPill, background: connected ? '#0f3320' : '#3d1212', borderColor: connected ? '#1a4d2e' : '#6e2020' }}>
            <span style={{ ...s.statusDot, background: connected ? '#3fb950' : '#f85149' }} />
            <span style={{ color: connected ? '#3fb950' : '#f85149', fontSize: 11, fontWeight: 700 }}>
              {connected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          {user && (
            <>
              <span style={s.userName} className="dash-username">{user.email?.split('@')[0]}</span>
              <button onClick={logout} style={s.topBtn} className="dash-topbtn">Sign out</button>
            </>
          )}
        </div>
      </div>

      {/* LAYOUT */}
      <div style={s.layout} className="dash-layout">
        {/* LEFT SIDEBAR */}
        <div style={s.sidebar} className="dash-sidebar">
          {user && (
            <div style={s.sidebarSection}>
              <button onClick={() => setShowAddAgent(true)} style={s.addAgentBtn}>+ Add Server</button>
              <AgentList
                selectedId={selectedAgentId}
                onSelect={setSelectedAgentId}
                getToken={getToken}
                key={agentRefreshKey}
              />
            </div>
          )}

          <div style={s.sidebarDivider} />

          <div style={s.sidebarSection}>
            <div style={s.sidebarLabel}>Metrics</div>
            <MetricChart title="CPU" data={cpuHistory} unit="%" thresholds={{ warn: 70, crit: 85 }} mini />
            <MetricChart title="RAM" data={memHistory} unit="%" thresholds={{ warn: 75, crit: 90 }} mini />
            <MetricChart title="Disk" data={diskHistory} unit="%" thresholds={{ warn: 80, crit: 92 }} mini />
            <MetricChart title="Net↓" data={netRxHistory} unit=" Mb/s" mini />
            <MetricChart title="Net↑" data={netTxHistory} unit=" Mb/s" mini />
            <div style={s.memDetail}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={s.memLabel}>Memory</span>
                {metrics && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowMemInfo(v => !v)}
                      style={s.infoBtn}
                      title="Memory info"
                    >i</button>
                    {showMemInfo && (
                      <div style={s.memTooltip}>
                        <div style={s.memTooltipRow}>
                          <span style={s.memTooltipLabel}>Physical RAM</span>
                          <span style={s.memTooltipVal}>{physicalGB} GB</span>
                        </div>
                        {pageFileGB > 0 && (
                          <div style={s.memTooltipRow}>
                            <span style={s.memTooltipLabel}>Page File</span>
                            <span style={s.memTooltipVal}>{pageFileGB} GB</span>
                          </div>
                        )}
                        <div style={s.memTooltipNote}>
                          Windows page file is virtual memory on disk, not real RAM.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span style={s.memValue}>{memGB}</span>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div style={s.main} className="dash-main">
          <div style={s.chartsGrid} className="dash-charts">
            <MetricChart title="CPU Usage" data={cpuHistory} unit="%" thresholds={{ warn: 70, crit: 85 }} />
            <MetricChart title="Memory" data={memHistory} unit="%" thresholds={{ warn: 75, crit: 90 }} />
            <MetricChart title="Network ↓" data={netRxHistory} unit=" Mb/s" color="#58a6ff" />
            <MetricChart title="Disk Usage" data={diskHistory} unit="%" thresholds={{ warn: 80, crit: 92 }} />
          </div>
          <div style={s.logArea} className="dash-logarea">
            <LogStream logs={logs} />
          </div>
        </div>

        {/* RIGHT */}
        <div style={s.rightPanel} className="dash-right">
          <ContainerList containers={containers} />
          <AIPanel
            agentId={selectedAgentId}
            getToken={getToken}
          />
        </div>
      </div>

      {showAddAgent && (
        <AddAgentModal
          getToken={getToken}
          onClose={() => setShowAddAgent(false)}
          onCreated={() => setAgentRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
}

const s = {
  app: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d1117', color: '#e6edf3', overflow: 'hidden' },
  topBar: { alignItems: 'center', background: '#161b22', borderBottom: '1px solid #21262d', display: 'flex', flexShrink: 0, gap: 16, height: 52, justifyContent: 'space-between', padding: '0 20px' },
  brand: { alignItems: 'center', display: 'flex', gap: 8, minWidth: 140 },
  brandName: { fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' },
  topCenter: { display: 'flex', flex: 1, gap: 24, justifyContent: 'center' },
  topStat: { alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 1 },
  topStatLabel: { color: '#6e7681', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' },
  topStatValue: { color: '#e6edf3', fontSize: 15, fontVariantNumeric: 'tabular-nums', fontWeight: 700 },
  topRight: { alignItems: 'center', display: 'flex', gap: 10, justifyContent: 'flex-end', minWidth: 280 },
  clock: { color: '#8b949e', fontFamily: 'monospace', fontSize: 13, fontVariantNumeric: 'tabular-nums', fontWeight: 600 },
  statusPill: { alignItems: 'center', border: '1px solid', borderRadius: 16, display: 'flex', gap: 6, padding: '4px 10px' },
  statusDot: { borderRadius: '50%', height: 7, width: 7 },
  userName: { color: '#8b949e', fontSize: 13 },
  topBtn: { background: 'none', border: '1px solid #30363d', borderRadius: 5, color: '#8b949e', cursor: 'pointer', fontSize: 11, padding: '3px 10px' },
  layout: { display: 'grid', flex: 1, gridTemplateColumns: '200px 1fr 300px', overflow: 'hidden' },
  sidebar: { background: '#0d1117', borderRight: '1px solid #21262d', display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto', padding: '12px 10px' },
  sidebarSection: { display: 'flex', flexDirection: 'column', gap: 6 },
  sidebarDivider: { borderTop: '1px solid #21262d', margin: '10px 0' },
  sidebarLabel: { color: '#6e7681', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 2px 4px', textTransform: 'uppercase' },
  addAgentBtn: { background: '#0d2035', border: '1px solid #1f4060', borderRadius: 6, color: '#58a6ff', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '7px 0', textAlign: 'center', width: '100%', marginBottom: 4 },
  memDetail: { background: '#161b22', border: '1px solid #21262d', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 12px' },
  memLabel: { color: '#6e7681', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' },
  memValue: { color: '#c9d1d9', fontSize: 12, fontVariantNumeric: 'tabular-nums', fontWeight: 600 },
  infoBtn: { background: '#21262d', border: '1px solid #30363d', borderRadius: '50%', color: '#8b949e', cursor: 'pointer', fontSize: 9, fontWeight: 700, height: 14, lineHeight: '12px', padding: 0, textAlign: 'center', width: 14 },
  memTooltip: { background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, bottom: '100%', boxShadow: '0 4px 16px rgba(0,0,0,0.5)', left: '50%', marginBottom: 6, minWidth: 200, padding: '10px 12px', position: 'absolute', transform: 'translateX(-50%)', zIndex: 100 },
  memTooltipRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
  memTooltipLabel: { color: '#8b949e', fontSize: 11 },
  memTooltipVal: { color: '#e6edf3', fontSize: 11, fontWeight: 600 },
  memTooltipNote: { borderTop: '1px solid #21262d', color: '#6e7681', fontSize: 10, lineHeight: 1.4, marginTop: 6, paddingTop: 6 },
  main: { display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'hidden', padding: 12 },
  chartsGrid: { display: 'grid', flex: '0 0 360px', gap: 10, gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' },
  logArea: { display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 },
  rightPanel: { borderLeft: '1px solid #21262d', display: 'flex', flexDirection: 'column', overflow: 'hidden' }
};
