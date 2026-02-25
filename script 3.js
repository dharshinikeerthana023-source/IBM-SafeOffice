/**
 * SENTINEL — Smart Employee Activity Monitoring System
 * script.js — Core Application Logic & Simulations
 * ============================================================
 * Architecture:
 *  - State management via plain JS object
 *  - Modular initialization functions
 *  - Simulated real-time data streams
 *  - Canvas-based chart rendering (no external libs)
 * ============================================================
 */

/* ============================================================
   STATE
============================================================ */
const APP = {
  currentUser: null,
  currentView: 'dashboardView',
  employees: [],
  alerts: [],
  activityLog: [],
  heatmapData: [],
  pulseHistory: new Array(60).fill(0),
  updateIntervals: [],
  alertFilter: 'all',
  activityFilter: 'all',
};

/* ============================================================
   MOCK DATA
============================================================ */
const DEPARTMENTS = ['Engineering', 'Finance', 'HR', 'Legal', 'IT Ops', 'Sales', 'Marketing'];
const DEVICES = ['MacBook Pro', 'ThinkPad X1', 'Surface Pro', 'Dell XPS', 'Remote Desktop'];
const BROWSERS = ['Chrome 120', 'Firefox 121', 'Edge 119', 'Safari 17'];
const ACTIONS = {
  login: ['Logged in', 'Multi-factor authenticated', 'Session resumed', 'VPN Connected'],
  file: ['Accessed /confidential/Q4-Report.xlsx', 'Downloaded client_data.csv', 'Modified payroll_2024.xlsx', 'Viewed HR_records.pdf', 'Uploaded to /shared/finance/', 'Accessed /system/config.json'],
  alert: ['Bulk data download detected', 'Off-hours system access', 'Unusual privilege escalation', 'Failed authentication ×5', 'Accessing restricted directories'],
};

const ALERT_TYPES = [
  { title: 'Bulk Data Exfiltration Attempt', desc: 'Employee downloaded 2.4GB of confidential files within 10 minutes.', severity: 'critical' },
  { title: 'Privilege Escalation Detected', desc: 'Unauthorized attempt to gain admin-level access detected on core system.', severity: 'critical' },
  { title: 'Off-Hours Access — Sensitive Folder', desc: 'Login at 03:17 AM with access to legal documents. No prior pattern.', severity: 'critical' },
  { title: 'Multiple Failed Authentication', desc: '7 consecutive failed login attempts from single workstation in 2 minutes.', severity: 'high' },
  { title: 'VPN Bypass Attempt', desc: 'Traffic routed through unknown external proxy circumventing enterprise VPN.', severity: 'high' },
  { title: 'Abnormal Data Access Velocity', desc: 'User accessed 340 records in 12 minutes — 8x above baseline average.', severity: 'high' },
  { title: 'Unusual Geographic Login', desc: 'Simultaneous login from Chennai and Frankfurt within 3 minutes.', severity: 'high' },
  { title: 'Shadow IT Application Detected', desc: 'Unauthorized cloud storage app (personal Dropbox) used to transfer files.', severity: 'medium' },
  { title: 'Clipboard Data Monitoring Alert', desc: 'Sensitive employee data copied to clipboard — possible exfiltration.', severity: 'medium' },
  { title: 'Config File Modification', desc: 'System configuration file altered outside of scheduled maintenance window.', severity: 'medium' },
  { title: 'Unusual Print Job Volume', desc: 'Employee printed 84 pages of confidential documents to local printer.', severity: 'medium' },
  { title: 'Session Duration Anomaly', desc: 'Active session running for 18+ hours without any interaction detected.', severity: 'low' },
  { title: 'New Device First Login', desc: 'Login from previously unseen device: "HP EliteBook — SN#AB2341".', severity: 'low' },
  { title: 'Password Change Off-Hours', desc: 'Account password changed at 11:45 PM, outside standard work hours.', severity: 'low' },
];

function generateEmployees(count = 20) {
  const firstNames = ['Arjun', 'Priya', 'Ravi', 'Meena', 'Kiran', 'Nisha', 'Rohit', 'Divya', 'Sanjay', 'Anita', 'Vikram', 'Pooja', 'Rahul', 'Kavitha', 'Suresh', 'Lakshmi', 'Deepak', 'Sneha', 'Arun', 'Chitra'];
  const lastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Nair', 'Reddy', 'Iyer', 'Rao', 'Mehta', 'Gupta'];
  const risks = ['low', 'low', 'low', 'low', 'medium', 'medium', 'high'];

  return Array.from({ length: count }, (_, i) => {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const risk = risks[Math.floor(Math.random() * risks.length)];
    const isOnline = Math.random() > 0.25;
    const isIdle = !isOnline ? false : Math.random() > 0.7;
    const isFlagged = risk === 'high' && Math.random() > 0.5;

    const loginH = 7 + Math.floor(Math.random() * 4);
    const loginM = Math.floor(Math.random() * 60);
    const sessionMin = 30 + Math.floor(Math.random() * 480);
    const sessionH = Math.floor(sessionMin / 60);
    const sessionRemainder = sessionMin % 60;

    let status = 'offline';
    if (isOnline) status = isFlagged ? 'flagged' : (isIdle ? 'idle' : 'online');

    return {
      id: `EMP-${String(2000 + i).padStart(4, '0')}`,
      name: `${fn} ${ln}`,
      initials: `${fn[0]}${ln[0]}`,
      dept: DEPARTMENTS[i % DEPARTMENTS.length],
      risk,
      status,
      loginTime: `${String(loginH).padStart(2,'0')}:${String(loginM).padStart(2,'0')} AM`,
      session: `${sessionH}h ${sessionRemainder}m`,
      device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
      riskScore: risk === 'low' ? 10 + Math.floor(Math.random() * 30) : risk === 'medium' ? 40 + Math.floor(Math.random() * 30) : 70 + Math.floor(Math.random() * 30),
      events: 20 + Math.floor(Math.random() * 300),
    };
  });
}

function generateAlerts() {
  return ALERT_TYPES.map((a, i) => ({
    ...a,
    id: `INC-${String(5001 + i).padStart(4, '0')}`,
    user: APP.employees[Math.floor(Math.random() * Math.min(APP.employees.length, 5))]?.name || 'Unknown',
    timestamp: getRelativeTime(i * 14 + Math.floor(Math.random() * 10)),
    resolved: Math.random() > 0.7,
  }));
}

function getRelativeTime(minsAgo) {
  if (minsAgo < 60) return `${minsAgo}m ago`;
  const h = Math.floor(minsAgo / 60);
  return `${h}h ${minsAgo % 60}m ago`;
}

/* ============================================================
   PARTICLE BACKGROUND
============================================================ */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');

  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.size = Math.random() * 1.5 + 0.3;
      this.alpha = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: 80 }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  animate();
}

/* ============================================================
   LOGIN
============================================================ */
function initLogin() {
  updateLoginDateTime();
  setInterval(updateLoginDateTime, 1000);
  detectDevice();
}

function updateLoginDateTime() {
  const now = new Date();
  const dateEl = document.getElementById('loginDate');
  const timeEl = document.getElementById('loginTime');
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString('en-IN', { hour12: false });
  }
}

function detectDevice() {
  const ua = navigator.userAgent;
  const grid = document.getElementById('deviceInfo');
  if (!grid) return;

  let os = 'Unknown OS';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone')) os = 'iOS';

  let browser = 'Unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  const info = [
    { label: 'OS', val: os },
    { label: 'BROWSER', val: browser },
    { label: 'SCREEN', val: `${screen.width}×${screen.height}` },
    { label: 'TIMEZONE', val: Intl.DateTimeFormat().resolvedOptions().timeZone },
  ];

  grid.innerHTML = info.map(item => `
    <div class="device-item">
      <span class="device-item-label">${item.label}</span>
      <span class="device-item-val">${item.val}</span>
    </div>
  `).join('');
}

function handleLogin() {
  const id = document.getElementById('employeeId').value.trim();
  const code = document.getElementById('accessCode').value.trim();
  const btn = document.getElementById('loginBtn');

  if (!id || !code) {
    showToast('Please enter Employee ID and Access Code', 'warning');
    return;
  }

  // Simulate authentication
  btn.querySelector('.btn-text').textContent = 'AUTHENTICATING...';
  btn.style.opacity = '0.7';
  btn.disabled = true;

  setTimeout(() => {
    APP.currentUser = { id, name: id.toUpperCase(), role: 'Security Admin' };
    document.getElementById('topbarUser').textContent = id;
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
    btn.querySelector('.btn-text').textContent = 'AUTHENTICATE';
    btn.style.opacity = '';
    btn.disabled = false;
    initDashboard();
    showToast('Authentication successful. Welcome, ' + id, 'success');
  }, 1800);
}

function handleLogout() {
  APP.updateIntervals.forEach(clearInterval);
  APP.updateIntervals = [];
  document.getElementById('dashboardPage').classList.remove('active');
  document.getElementById('loginPage').classList.add('active');
  showToast('Logged out successfully.', 'info');
}

/* ============================================================
   DASHBOARD INIT
============================================================ */
function initDashboard() {
  APP.employees = generateEmployees(22);
  APP.alerts = generateAlerts();

  updateTopbarClock();
  APP.updateIntervals.push(setInterval(updateTopbarClock, 1000));

  renderEmployeeTable(APP.employees);
  renderAlertsList(APP.alerts);
  renderHighRiskList();
  renderTimeline();
  renderActivityLog();
  renderFootprints();
  renderScorecard();
  buildHeatmap();
  buildNavFlowDiagram();

  // Charts
  drawPulseChart();
  drawRiskDonut();
  drawTrendChart();
  drawBehaviorRadar(0);
  drawDeptRiskChart();
  drawSparklines();

  // Animate gauge
  setTimeout(animateGauge, 500);

  // Real-time simulations
  APP.updateIntervals.push(setInterval(simulatePulse, 1500));
  APP.updateIntervals.push(setInterval(simulateNewActivity, 4000));
  APP.updateIntervals.push(setInterval(updateKPICounters, 8000));
  APP.updateIntervals.push(setInterval(simulateNewAlert, 20000));
}

function updateTopbarClock() {
  const el = document.getElementById('topbarClock');
  if (el) el.textContent = new Date().toLocaleTimeString('en-IN', { hour12: false });
}

/* ============================================================
   EMPLOYEE TABLE
============================================================ */
function renderEmployeeTable(employees) {
  const tbody = document.getElementById('employeeTableBody');
  if (!tbody) return;

  tbody.innerHTML = employees.map(emp => `
    <tr data-id="${emp.id}">
      <td>
        <div class="employee-info">
          <div class="employee-avatar">${emp.initials}</div>
          <div>
            <div class="employee-name">${emp.name}</div>
            <div class="employee-id">${emp.id}</div>
          </div>
        </div>
      </td>
      <td>${emp.dept}</td>
      <td class="mono" style="color:var(--text-secondary);font-size:11px">${emp.loginTime}</td>
      <td class="mono" style="font-size:11px;color:var(--accent)">${emp.session}</td>
      <td style="font-size:11px">${emp.device}</td>
      <td><span class="risk-badge ${emp.risk}">${emp.risk.toUpperCase()}</span></td>
      <td><span class="status-badge ${emp.status}">${emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}</span></td>
      <td><button class="tbl-btn" onclick="showEmployeeModal('${emp.id}')">INSPECT</button></td>
    </tr>
  `).join('');
}

function filterTable(query) {
  const filtered = APP.employees.filter(e =>
    e.name.toLowerCase().includes(query.toLowerCase()) ||
    e.id.toLowerCase().includes(query.toLowerCase()) ||
    e.dept.toLowerCase().includes(query.toLowerCase())
  );
  renderEmployeeTable(filtered);
}

/* ============================================================
   HEATMAP
============================================================ */
function buildHeatmap() {
  const grid = document.getElementById('heatmapGrid');
  if (!grid) return;

  const days = 7;
  const hours = 24;
  const cells = [];

  /* ── Generate realistic intensity per hour/day ──
     Business hours (8-18) = higher activity
     Off-hours = very low except for anomalies
     Weekend rows (5,6) = low overall             ── */
  for (let d = 0; d < days; d++) {
    for (let h = 0; h < hours; h++) {
      const isWeekend = d >= 5;
      const isBizHours = h >= 8 && h <= 18;
      let base;
      if (isWeekend) {
        base = Math.random() * 0.08;
      } else if (isBizHours) {
        base = 0.35 + Math.random() * 0.55;
      } else {
        base = Math.random() * 0.10;
      }
      // Inject anomaly spikes (off-hours bright red)
      const isAnomaly = !isBizHours && Math.random() > 0.95;
      if (isAnomaly) base = 0.85 + Math.random() * 0.15;
      cells.push({ intensity: base, anomaly: isAnomaly });
    }
  }

  APP.heatmapData = cells;

  grid.innerHTML = cells.map((cell, i) => {
    const v = cell.intensity;
    let bg, shadow = '', label;

    if (cell.anomaly) {
      // Bright red — anomaly spike
      bg = `rgba(255,59,92,${0.7 + v * 0.3})`;
      shadow = 'box-shadow:0 0 6px rgba(255,59,92,0.8);';
      label = '⚠ SPIKE';
    } else if (v < 0.08) {
      // Near black — no activity
      bg = `rgba(6,14,31,${0.5 + v * 2})`;
      label = 'No activity';
    } else if (v < 0.30) {
      // Dark blue — low activity
      bg = `rgba(0,${Math.round(40 + v*160)},${Math.round(128 + v*100)},${0.4 + v})`;
      label = 'Low activity';
    } else if (v < 0.60) {
      // Cyan — moderate / normal business hours
      bg = `rgba(0,${Math.round(180 + v*60)},255,${0.5 + v * 0.5})`;
      label = 'Normal activity';
    } else {
      // Bright amber/yellow — high activity
      const r = Math.round(200 + v * 55);
      const g = Math.round(140 + v * 74);
      bg = `rgba(${r},${g},0,${0.6 + v * 0.4})`;
      shadow = `box-shadow:0 0 4px rgba(255,184,0,0.5);`;
      label = 'High activity';
    }

    const day = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][Math.floor(i/24)];
    const hour = i % 24;
    const hourStr = hour === 0 ? '12AM' : hour < 12 ? hour+'AM' : hour === 12 ? '12PM' : (hour-12)+'PM';
    const pct = Math.round(v * 100);

    return `<div class="heatmap-cell"
      style="background:${bg};${shadow}"
      title="${day} ${hourStr} — ${label} (${pct}%)"></div>`;
  }).join('');
}

function updateHeatmap(range) {
  buildHeatmap();
}

/* ============================================================
   PULSE CHART (Canvas)
============================================================ */
let pulseCtx = null;
let pulseAnimFrame = null;

function drawPulseChart() {
  const canvas = document.getElementById('pulseChart');
  if (!canvas) return;

  canvas.width = canvas.offsetWidth || 500;
  canvas.height = 160;
  pulseCtx = canvas.getContext('2d');

  // Init history with some data
  APP.pulseHistory = Array.from({ length: 80 }, (_, i) => {
    const base = 40 + Math.sin(i * 0.2) * 20;
    return base + Math.random() * 20;
  });

  renderPulse();
}

function renderPulse() {
  if (!pulseCtx) return;
  const canvas = pulseCtx.canvas;
  const W = canvas.width;
  const H = canvas.height;
  const data = APP.pulseHistory;
  const len = data.length;

  pulseCtx.clearRect(0, 0, W, H);

  // Grid lines
  pulseCtx.strokeStyle = 'rgba(0,212,255,0.06)';
  pulseCtx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = (H / 5) * i;
    pulseCtx.beginPath();
    pulseCtx.moveTo(0, y);
    pulseCtx.lineTo(W, y);
    pulseCtx.stroke();
  }

  const max = Math.max(...data) || 100;
  const min = Math.min(...data) || 0;
  const range = max - min || 1;

  function xPos(i) { return (i / (len - 1)) * W; }
  function yPos(v) { return H - ((v - min) / range) * H * 0.85 - H * 0.07; }

  // Filled area
  const grad = pulseCtx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(0,212,255,0.25)');
  grad.addColorStop(1, 'rgba(0,212,255,0)');

  pulseCtx.beginPath();
  pulseCtx.moveTo(xPos(0), H);
  data.forEach((v, i) => pulseCtx.lineTo(xPos(i), yPos(v)));
  pulseCtx.lineTo(xPos(len - 1), H);
  pulseCtx.closePath();
  pulseCtx.fillStyle = grad;
  pulseCtx.fill();

  // Line
  pulseCtx.beginPath();
  data.forEach((v, i) => {
    if (i === 0) pulseCtx.moveTo(xPos(i), yPos(v));
    else pulseCtx.lineTo(xPos(i), yPos(v));
  });
  pulseCtx.strokeStyle = '#00D4FF';
  pulseCtx.lineWidth = 1.5;
  pulseCtx.shadowColor = '#00D4FF';
  pulseCtx.shadowBlur = 6;
  pulseCtx.stroke();
  pulseCtx.shadowBlur = 0;

  // Current value dot
  const lastX = xPos(len - 1);
  const lastY = yPos(data[len - 1]);
  pulseCtx.beginPath();
  pulseCtx.arc(lastX, lastY, 3, 0, Math.PI * 2);
  pulseCtx.fillStyle = '#00D4FF';
  pulseCtx.shadowColor = '#00D4FF';
  pulseCtx.shadowBlur = 10;
  pulseCtx.fill();
  pulseCtx.shadowBlur = 0;
}

function simulatePulse() {
  const newVal = 40 + Math.sin(Date.now() / 2000) * 25 + Math.random() * 20;
  APP.pulseHistory.push(newVal);
  if (APP.pulseHistory.length > 80) APP.pulseHistory.shift();
  renderPulse();
}

/* ============================================================
   RISK DONUT (Canvas)
============================================================ */
function drawRiskDonut() {
  const canvas = document.getElementById('riskDonut');
  if (!canvas) return;

  canvas.width = 140;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  const cx = 70, cy = 70, r = 52, lineW = 12;

  const segments = [
    { val: 73, color: '#00e676', glow: 'rgba(0,230,118,0.4)' },
    { val: 19, color: '#FFB800', glow: 'rgba(255,184,0,0.4)' },
    { val: 8, color: '#ff3b5c', glow: 'rgba(255,59,92,0.5)' },
  ];

  let startAngle = -Math.PI / 2;
  ctx.clearRect(0, 0, 140, 140);

  segments.forEach(seg => {
    const angle = (seg.val / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, startAngle + angle);
    ctx.strokeStyle = seg.color;
    ctx.lineWidth = lineW;
    ctx.shadowColor = seg.glow;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
    startAngle += angle + 0.04;
  });

  // Center
  ctx.beginPath();
  ctx.arc(cx, cy, r - lineW / 2 - 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(6,14,31,0.8)';
  ctx.fill();
}

/* ============================================================
   SPARKLINES (Canvas)
============================================================ */
function drawSparklines() {
  const configs = [
    { id: 'spark1', color: '#00D4FF', data: [80, 95, 88, 102, 115, 108, 120, 115, 124, 130, 120, 140] },
    { id: 'spark2', color: '#ff3b5c', data: [5, 8, 6, 10, 8, 12, 15, 11, 14, 18, 16, 18] },
    { id: 'spark3', color: '#FFB800', data: [900, 1100, 980, 1300, 1200, 1500, 1400, 1600, 1700, 1800, 1750, 1842] },
    { id: 'spark4', color: '#00e676', data: [88, 87, 89, 90, 91, 90, 92, 93, 91, 94, 93, 94.2] },
  ];

  configs.forEach(cfg => {
    const canvas = document.getElementById(cfg.id);
    if (!canvas) return;
    canvas.width = 100;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    const data = cfg.data;
    const W = 100, H = 40;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const xStep = W / (data.length - 1);

    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * xStep;
      const y = H - ((v - min) / range) * H * 0.8 - 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = cfg.color;
    ctx.shadowBlur = 4;
    ctx.stroke();
  });
}

/* ============================================================
   TREND CHART (Canvas)
============================================================ */
function drawTrendChart() {
  const canvas = document.getElementById('trendChart');
  if (!canvas) return;

  const parent = canvas.parentElement;
  canvas.width = parent.offsetWidth - 40 || 700;
  canvas.height = 220;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const normal = [2400, 2800, 2600, 3100, 2900, 1200, 800];
  const suspicious = [45, 62, 38, 89, 71, 15, 8];

  ctx.clearRect(0, 0, W, H);

  // Grid
  const gridLines = 5;
  const maxVal = Math.max(...normal);
  for (let i = 0; i <= gridLines; i++) {
    const y = pad.top + ((H - pad.top - pad.bottom) / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.strokeStyle = 'rgba(0,212,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Y labels
    const val = Math.round(maxVal - (maxVal / gridLines) * i);
    ctx.fillStyle = 'rgba(122,154,184,0.7)';
    ctx.font = '10px Share Tech Mono';
    ctx.textAlign = 'right';
    ctx.fillText(val.toLocaleString(), pad.left - 8, y + 4);
  }

  const xStep = (W - pad.left - pad.right) / (labels.length - 1);
  const yScale = (H - pad.top - pad.bottom) / maxVal;

  // Normal area
  const gradNormal = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
  gradNormal.addColorStop(0, 'rgba(0,212,255,0.2)');
  gradNormal.addColorStop(1, 'rgba(0,212,255,0)');

  ctx.beginPath();
  ctx.moveTo(pad.left, H - pad.bottom);
  normal.forEach((v, i) => ctx.lineTo(pad.left + i * xStep, H - pad.bottom - v * yScale));
  ctx.lineTo(pad.left + (labels.length - 1) * xStep, H - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = gradNormal;
  ctx.fill();

  ctx.beginPath();
  normal.forEach((v, i) => {
    const x = pad.left + i * xStep, y = H - pad.bottom - v * yScale;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#00D4FF';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00D4FF';
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Suspicious bars with value labels above
  const barW = 8;
  const suspScale = (H - pad.top - pad.bottom) / Math.max(...suspicious) * 0.28;
  suspicious.forEach((v, i) => {
    const x = pad.left + i * xStep - barW / 2;
    const bH = v * suspScale;
    const y = H - pad.bottom - bH;
    // Bar
    ctx.fillStyle = 'rgba(255,59,92,0.85)';
    ctx.shadowColor = 'rgba(255,59,92,0.6)';
    ctx.shadowBlur = 8;
    ctx.fillRect(x, y, barW, bH);
    ctx.shadowBlur = 0;
    // Value label above bar
    ctx.fillStyle = '#ff3b5c';
    ctx.font = 'bold 9px Share Tech Mono';
    ctx.textAlign = 'center';
    ctx.fillText(v, pad.left + i * xStep, y - 4);
  });

  // Normal activity dots + value labels at peaks
  normal.forEach((v, i) => {
    const x = pad.left + i * xStep;
    const y = H - pad.bottom - v * yScale;
    // Dot on line
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#00D4FF';
    ctx.shadowColor = '#00D4FF';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    // Value label above dot
    ctx.fillStyle = 'rgba(0,212,255,0.9)';
    ctx.font = 'bold 9px Share Tech Mono';
    ctx.textAlign = 'center';
    ctx.fillText(v.toLocaleString(), x, y - 8);
  });

  // X labels (day names)
  labels.forEach((l, i) => {
    const x = pad.left + i * xStep;
    ctx.fillStyle = 'rgba(122,154,184,0.9)';
    ctx.font = '10px Share Tech Mono';
    ctx.textAlign = 'center';
    ctx.fillText(l, x, H - pad.bottom + 16);
  });

  // Axis titles
  ctx.save();
  ctx.translate(12, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = 'rgba(122,154,184,0.6)';
  ctx.font = '9px Share Tech Mono';
  ctx.textAlign = 'center';
  ctx.fillText('EVENTS / DAY', 0, 0);
  ctx.restore();

  // Annotation: mark highest suspicious day
  const maxSuspIdx = suspicious.indexOf(Math.max(...suspicious));
  const sx = pad.left + maxSuspIdx * xStep;
  const sy = H - pad.bottom - suspicious[maxSuspIdx] * suspScale - 20;
  ctx.fillStyle = 'rgba(255,59,92,0.9)';
  ctx.font = 'bold 9px Share Tech Mono';
  ctx.textAlign = 'center';
  ctx.fillText('⚠ PEAK RISK', sx, sy);
}

/* ============================================================
   BEHAVIOR RADAR (Canvas)
============================================================ */
/* Employee behavior profiles - realistic per-person data */
const BEHAVIOR_PROFILES = [
  { name: 'Arjun Kumar',  risk: 'high',   values: [0.92, 0.45, 0.95, 0.80, 0.85, 0.88], color: '#ff3b5c' },
  { name: 'Priya Sharma', risk: 'high',   values: [0.85, 0.60, 0.90, 0.70, 0.75, 0.30], color: '#ff3b5c' },
  { name: 'Ravi Patel',   risk: 'medium', values: [0.50, 0.70, 0.45, 0.55, 0.40, 0.60], color: '#FFB800' },
  { name: 'Rohit Reddy',  risk: 'medium', values: [0.60, 0.50, 0.55, 0.65, 0.35, 0.70], color: '#FFB800' },
  { name: 'Sanjay Rao',   risk: 'low',    values: [0.30, 0.40, 0.25, 0.35, 0.10, 0.20], color: '#00e676' },
];
/* Normal baseline - what a safe employee looks like */
const NORMAL_BASELINE = [0.35, 0.40, 0.30, 0.40, 0.10, 0.25];

function updateBehaviorRadar(idx) {
  drawBehaviorRadar(parseInt(idx));
}

function drawBehaviorRadar(profileIdx) {
  const canvas = document.getElementById('behaviorRadar');
  if (!canvas) return;

  const idx = profileIdx !== undefined ? profileIdx : 0;
  const profile = BEHAVIOR_PROFILES[idx] || BEHAVIOR_PROFILES[0];

  canvas.width = canvas.offsetWidth || 280;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2 + 6;
  const r = Math.min(W, H) * 0.32;

  const labels = ['Data Access', 'Auth Events', 'File Transfer', 'Network', 'Off-Hours', 'Privilege'];
  const values = profile.values;
  const baseline = NORMAL_BASELINE;
  const n = labels.length;
  const angleStep = (Math.PI * 2) / n;

  ctx.clearRect(0, 0, W, H);

  /* ── Grid rings with percentage labels ── */
  [0.25, 0.50, 0.75, 1.0].forEach((scale, si) => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + Math.cos(angle) * r * scale;
      const y = cy + Math.sin(angle) * r * scale;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0,212,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Ring percentage label
    ctx.fillStyle = 'rgba(122,154,184,0.4)';
    ctx.font = '7px Share Tech Mono';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(scale*100)+'%', cx, cy - r * scale + 4);
  });

  /* ── Axis lines ── */
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.strokeStyle = 'rgba(0,212,255,0.07)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /* ── Normal baseline polygon (grey dashed) ── */
  ctx.beginPath();
  ctx.setLineDash([3, 3]);
  baseline.forEach((v, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = cx + Math.cos(angle) * r * v;
    const y = cy + Math.sin(angle) * r * v;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.strokeStyle = 'rgba(150,180,210,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(150,180,210,0.04)';
  ctx.fill();

  /* ── Employee data polygon ── */
  const empColor = profile.color;
  const empGlow  = empColor + '44';

  ctx.beginPath();
  values.forEach((v, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = cx + Math.cos(angle) * r * v;
    const y = cy + Math.sin(angle) * r * v;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = empColor.replace(')', ',0.12)').replace('rgb', 'rgba').replace('#ff3b5c','rgba(255,59,92,0.13)').replace('#FFB800','rgba(255,184,0,0.12)').replace('#00e676','rgba(0,230,118,0.12)');
  ctx.fill();
  ctx.strokeStyle = empColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = empColor;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  /* ── Data point dots ── */
  values.forEach((v, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = cx + Math.cos(angle) * r * v;
    const y = cy + Math.sin(angle) * r * v;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI*2);
    ctx.fillStyle = empColor;
    ctx.shadowColor = empColor;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Percentage value label near each dot
    const lx = cx + Math.cos(angle) * r * (v + 0.16);
    const ly = cy + Math.sin(angle) * r * (v + 0.16);
    ctx.fillStyle = empColor;
    ctx.font = 'bold 8px Share Tech Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(v*100)+'%', lx, ly);
  });

  /* ── Axis labels (category names) ── */
  labels.forEach((l, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const lx = cx + Math.cos(angle) * (r + 24);
    const ly = cy + Math.sin(angle) * (r + 24);
    ctx.fillStyle = 'rgba(180,210,240,0.85)';
    ctx.font = '8.5px Share Tech Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(l, lx, ly);
  });

  /* ── Risk label in bottom-left ── */
  const riskLabel = profile.risk.toUpperCase() + ' RISK';
  const riskCol   = profile.risk === 'high' ? '#ff3b5c' : profile.risk === 'medium' ? '#FFB800' : '#00e676';
  ctx.fillStyle = riskCol;
  ctx.font = 'bold 9px Share Tech Mono';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('● ' + riskLabel, 8, H - 4);
}

/* ============================================================
   DEPT RISK CHART (Canvas)
============================================================ */
function drawDeptRiskChart() {
  const canvas = document.getElementById('deptRiskChart');
  if (!canvas) return;

  canvas.width = canvas.offsetWidth || 260;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const pad = { top: 16, right: 20, bottom: 30, left: 55 };

  const depts = ['Finance', 'Legal', 'IT Ops', 'HR', 'Engineering', 'Sales'];
  const scores = [82, 76, 45, 38, 62, 29];
  const barH = (H - pad.top - pad.bottom) / depts.length - 4;

  ctx.clearRect(0, 0, W, H);

  const maxScore = 100;
  const xScale = (W - pad.left - pad.right) / maxScore;

  depts.forEach((dept, i) => {
    const y = pad.top + i * (barH + 4);
    const bW = scores[i] * xScale;

    // Dept label
    ctx.fillStyle = 'rgba(122,154,184,0.8)';
    ctx.font = '10px Share Tech Mono';
    ctx.textAlign = 'right';
    ctx.fillText(dept, pad.left - 6, y + barH / 2 + 3);

    // Bar background
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(pad.left, y, W - pad.left - pad.right, barH);

    // Bar fill color based on score
    const color = scores[i] > 70 ? '#ff3b5c' : scores[i] > 50 ? '#FFB800' : '#00e676';
    const glow = scores[i] > 70 ? 'rgba(255,59,92,0.5)' : scores[i] > 50 ? 'rgba(255,184,0,0.4)' : 'rgba(0,230,118,0.3)';

    ctx.fillStyle = color;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 8;
    ctx.fillRect(pad.left, y, bW, barH);
    ctx.shadowBlur = 0;

    // Score label
    ctx.fillStyle = color;
    ctx.font = '10px Share Tech Mono';
    ctx.textAlign = 'left';
    ctx.fillText(scores[i], pad.left + bW + 4, y + barH / 2 + 3);
  });
}

/* ============================================================
   GAUGE ANIMATION
============================================================ */
function animateGauge() {
  const needle = document.getElementById('gaugeNeedle');
  const label  = document.getElementById('gaugeStatusLabel');
  if (!needle) return;
  needle.style.transition = 'transform 1.5s cubic-bezier(0.4,0,0.2,1)';
  needle.style.transform = 'rotate(80deg)';

  // Animate the score counting up from 0 to 94.2
  const valEl = document.getElementById('gaugeValue');
  if (valEl) {
    let count = 0;
    const target = 94.2;
    const step = target / 60;
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      valEl.textContent = count.toFixed(1);
      if (count >= target) {
        clearInterval(timer);
        // Set status label
        if (label) {
          label.textContent = count >= 90 ? '● VERY STABLE' : count >= 70 ? '● MODERATE' : '⚠ UNSTABLE';
          label.style.fill = count >= 90 ? '#00e676' : count >= 70 ? '#FFB800' : '#ff3b5c';
        }
      }
    }, 25);
  }
}

/* ============================================================
   ALERTS
============================================================ */
function renderAlertsList(alerts) {
  const container = document.getElementById('alertsList');
  if (!container) return;

  const filter = APP.alertFilter;
  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  container.innerHTML = filtered.map(alert => `
    <div class="alert-item" onclick="showAlertModal('${alert.id}')">
      <div class="alert-severity-bar ${alert.severity}"></div>
      <div class="alert-content">
        <div class="alert-title">${alert.title}</div>
        <div class="alert-desc">${alert.desc}</div>
        <div class="alert-meta">
          <span class="sev-badge ${alert.severity}">${alert.severity.toUpperCase()}</span>
          <span class="alert-user">↪ ${alert.user}</span>
          <span class="alert-time">${alert.timestamp}</span>
          ${alert.resolved ? '<span style="color:var(--green);font-size:10px;font-family:var(--font-mono)">✓ RESOLVED</span>' : ''}
        </div>
      </div>
    </div>
  `).join('');

  if (filtered.length === 0) {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);font-family:var(--font-mono);font-size:12px">NO INCIDENTS MATCHING FILTER</div>';
  }
}

function filterAlerts() {
  APP.alertFilter = document.getElementById('alertSeverityFilter').value;
  renderAlertsList(APP.alerts);
}

function renderHighRiskList() {
  const container = document.getElementById('highRiskList');
  if (!container) return;

  const highRisk = APP.employees
    .filter(e => e.risk === 'high' || e.riskScore > 65)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  container.innerHTML = highRisk.map(emp => `
    <div class="hr-item">
      <div class="hr-avatar">${emp.initials}</div>
      <div class="hr-info">
        <div class="hr-name">${emp.name}</div>
        <div class="hr-dept">${emp.dept}</div>
      </div>
      <div class="hr-score">${emp.riskScore}</div>
    </div>
  `).join('');
}

function renderTimeline() {
  const container = document.getElementById('incidentTimeline');
  if (!container) return;

  const events = [
    { text: 'Bulk download flagged on EMP-2003', sev: 'critical', time: '14m ago',  action: 'Account auto-suspended' },
    { text: 'Privilege escalation attempt blocked', sev: 'high', time: '1h 2m ago', action: 'Access revoked' },
    { text: 'Off-hours access in Finance dept', sev: 'critical', time: '3h 18m ago',action: 'HR notified' },
    { text: 'Anomaly detected on 3 accounts', sev: 'medium', time: '5h ago',        action: 'Under review' },
    { text: 'System integrity check passed', sev: 'low', time: '8h ago',             action: 'No action needed' },
  ];

  const sevMeta = {
    critical: { label: 'CRITICAL', color: '#ff3b5c', icon: '🔴' },
    high:     { label: 'HIGH',     color: '#FFB800', icon: '🟠' },
    medium:   { label: 'MEDIUM',   color: '#00D4FF', icon: '🔵' },
    low:      { label: 'LOW',      color: '#00e676', icon: '🟢' },
  };

  container.innerHTML = events.map(ev => {
    const meta = sevMeta[ev.sev];
    return `
    <div class="tl-item">
      <div class="tl-dot ${ev.sev}"></div>
      <div class="tl-body">
        <div class="tl-sev-row">
          <span class="tl-sev-badge" style="color:${meta.color};border-color:${meta.color}40;background:${meta.color}12">${meta.icon} ${meta.label}</span>
          <span class="tl-time">${ev.time}</span>
        </div>
        <div class="tl-text">${ev.text}</div>
        <div class="tl-action">Action: ${ev.action}</div>
      </div>
    </div>`;
  }).join('');
}

/* ============================================================
   ACTIVITY LOG
============================================================ */
function renderActivityLog() {
  const container = document.getElementById('activityLogStream');
  if (!container) return;

  const types = ['login', 'file', 'file', 'alert', 'login', 'file'];
  const icons = { login: '⇒', file: '□', alert: '!' };

  const entries = APP.employees.slice(0, 30).map((emp, i) => {
    const type = types[i % types.length];
    const actions = ACTIONS[type] || ACTIONS.file;
    const action = actions[Math.floor(Math.random() * actions.length)];
    const minsAgo = i * 3 + Math.floor(Math.random() * 5);
    const risk = emp.risk;

    return { emp, type, action, minsAgo, risk };
  });

  APP.activityLog = entries;
  renderFilteredLog(APP.activityFilter);
}

function renderFilteredLog(filter) {
  const container = document.getElementById('activityLogStream');
  if (!container) return;

  const filtered = filter === 'all' ? APP.activityLog : APP.activityLog.filter(e => e.type === filter);

  const icons = { login: '⇒', file: '▣', alert: '!' };

  container.innerHTML = filtered.map(e => `
    <div class="log-entry" data-type="${e.type}">
      <span class="log-time">${getRelativeTime(e.minsAgo)}</span>
      <div class="log-type-icon ${e.type}">${icons[e.type] || '•'}</div>
      <span class="log-user">${e.emp.name}</span>
      <span class="log-action">${e.action}</span>
      <span class="log-risk"><span class="risk-badge ${e.risk}">${e.risk.toUpperCase()}</span></span>
    </div>
  `).join('');
}

function filterActivity(type, btn) {
  APP.activityFilter = type;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderFilteredLog(type);
}

/* ============================================================
   FOOTPRINTS
============================================================ */
function renderFootprints() {
  const container = document.getElementById('footprintList');
  if (!container) return;

  const footprints = [
    { user: 'Arjun Kumar', action: 'Accessed payroll module', path: '/hr/payroll/2024/', risk: 'high', time: '02:47' },
    { user: 'Priya Sharma', action: 'Downloaded bulk records', path: '/data/client_export.csv', risk: 'high', time: '08:12' },
    { user: 'Ravi Patel', action: 'Modified config file', path: '/system/config.json', risk: 'medium', time: '09:35' },
    { user: 'Meena Singh', action: 'Viewed financial reports', path: '/finance/Q4-2024/', risk: 'low', time: '10:18' },
    { user: 'Kiran Nair', action: 'Login from new device', path: '/auth/device-verify', risk: 'medium', time: '11:02' },
    { user: 'Rohit Reddy', action: 'Accessed restricted dir', path: '/admin/restricted/', risk: 'high', time: '13:44' },
    { user: 'Nisha Iyer', action: 'Bulk print job sent', path: '/print-queue/batch-84', risk: 'medium', time: '14:55' },
    { user: 'Sanjay Rao', action: 'Off-hours file transfer', path: '/uploads/external/', risk: 'high', time: '23:17' },
  ];

  container.innerHTML = footprints.map(f => `
    <div class="footprint-item">
      <div class="fp-time">${f.time}</div>
      <div class="fp-bar ${f.risk}"></div>
      <div class="fp-content">
        <div class="fp-user">${f.user}</div>
        <div class="fp-action">${f.action}</div>
        <div class="fp-path">${f.path}</div>
      </div>
      <span class="risk-badge ${f.risk}">${f.risk.toUpperCase()}</span>
    </div>
  `).join('');
}

/* ============================================================
   NAV FLOW DIAGRAM (SVG)
============================================================ */
function buildNavFlowDiagram() {
  const svg = document.getElementById('navFlowSvg');
  if (!svg) return;

  /* ── Layout: viewBox is 600×340 giving plenty of vertical room
     so label text (placed 42px below node centre) never clips.
     Node radius = 22px.  Label sits at cy+32 (outside circle)
     with a semi-transparent rect backdrop for legibility.       ── */
  const R = 22; // node radius

  const nodes = [
    { id: 'login',     label: 'LOGIN',       x:  70, y: 170, color: '#00e676', icon: '⇒' },
    { id: 'dashboard', label: 'DASHBOARD',   x: 200, y:  90, color: '#00D4FF', icon: '◈' },
    { id: 'files',     label: 'FILE SYSTEM', x: 200, y: 250, color: '#FFB800', icon: '▣' },
    { id: 'reports',   label: 'REPORTS',     x: 340, y:  60, color: '#00D4FF', icon: '≡' },
    { id: 'admin',     label: 'ADMIN PANEL', x: 340, y: 175, color: '#ff3b5c', icon: '⚙' },
    { id: 'export',    label: 'DATA EXPORT', x: 340, y: 285, color: '#ff3b5c', icon: '↗' },
    { id: 'logout',    label: 'LOGOUT',      x: 490, y: 170, color: '#00e676', icon: '✕' },
  ];

  const edges = [
    { from: 'login',     to: 'dashboard', weight: 1.0, suspicious: false },
    { from: 'login',     to: 'files',     weight: 0.4, suspicious: false },
    { from: 'dashboard', to: 'reports',   weight: 0.6, suspicious: false },
    { from: 'dashboard', to: 'admin',     weight: 0.8, suspicious: true  },
    { from: 'files',     to: 'export',    weight: 0.9, suspicious: true  },
    { from: 'files',     to: 'admin',     weight: 0.5, suspicious: true  },
    { from: 'admin',     to: 'logout',    weight: 0.3, suspicious: false },
    { from: 'export',    to: 'logout',    weight: 0.2, suspicious: false },
    { from: 'reports',   to: 'logout',    weight: 0.4, suspicious: false },
  ];

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  /* ── Draw edges as lines with arrowhead markers ── */
  const edgesHTML = edges.map(e => {
    const from  = nodeMap[e.from];
    const to    = nodeMap[e.to];
    const color = e.suspicious ? '#ff3b5c' : '#00D4FF';
    const opacity = 0.25 + e.weight * 0.55;
    const sw = 1 + e.weight * 2.5;

    // shorten line so it doesn't overlap the circles
    const dx = to.x - from.x, dy = to.y - from.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const ux = dx/dist, uy = dy/dist;
    const x1 = from.x + ux * (R + 2);
    const y1 = from.y + uy * (R + 2);
    const x2 = to.x   - ux * (R + 8);   // leave room for arrowhead
    const y2 = to.y   - uy * (R + 8);

    const markerId = e.suspicious ? 'arrowRed' : 'arrowCyan';
    return `
      <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}"
            x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
            stroke="${color}" stroke-width="${sw.toFixed(1)}"
            stroke-opacity="${opacity.toFixed(2)}"
            marker-end="url(#${markerId})"
            class="flow-edge${e.suspicious ? ' suspicious' : ''}"/>
    `;
  }).join('');

  /* ── Draw nodes: outer glow ring + filled circle + icon + label pill ── */
  const nodesHTML = nodes.map(n => {
    const labelW = n.label.length * 6.2 + 14; // approximate pill width
    const pillX  = -(labelW / 2);
    const pillY  = R + 10;           // below the circle
    const textY  = R + 10 + 10;     // vertically centred inside pill

    return `
      <g class="flow-node" transform="translate(${n.x},${n.y})" style="cursor:default">

        <!-- Outer glow pulse ring -->
        <circle r="${R + 8}" fill="none" stroke="${n.color}" stroke-width="1"
          stroke-opacity="0.18" class="node-ring"/>

        <!-- Main circle -->
        <circle r="${R}" fill="rgba(6,14,31,0.92)" stroke="${n.color}"
          stroke-width="2" style="filter:drop-shadow(0 0 8px ${n.color}55)"/>

        <!-- Icon inside circle -->
        <text text-anchor="middle" dominant-baseline="central"
          fill="${n.color}" font-size="13"
          style="font-family:'Share Tech Mono',monospace;user-select:none">
          ${n.icon}
        </text>

        <!-- Label background pill — sits BELOW the circle, never overlapping -->
        <rect x="${pillX.toFixed(1)}" y="${pillY.toFixed(1)}"
          width="${labelW.toFixed(1)}" height="16" rx="4"
          fill="rgba(6,14,31,0.82)" stroke="${n.color}"
          stroke-width="0.8" stroke-opacity="0.5"/>

        <!-- Label text inside pill -->
        <text x="0" y="${textY.toFixed(1)}"
          text-anchor="middle" dominant-baseline="central"
          fill="#c8daf0" font-size="8.5"
          style="font-family:'Share Tech Mono',monospace;letter-spacing:0.8px;user-select:none">
          ${n.label}
        </text>

      </g>
    `;
  }).join('');

  /* ── Legend ── */
  const legendHTML = `
    <g transform="translate(10, 10)">
      <rect width="190" height="36" rx="5" fill="rgba(6,14,31,0.75)"
        stroke="rgba(0,212,255,0.15)" stroke-width="0.8"/>
      <line x1="10" y1="13" x2="34" y2="13" stroke="#00D4FF" stroke-width="2" stroke-opacity="0.7"/>
      <text x="40" y="17" fill="#7a9ab8" font-size="9"
        style="font-family:'Share Tech Mono'">Normal navigation path</text>
      <line x1="10" y1="27" x2="34" y2="27" stroke="#ff3b5c" stroke-width="2" stroke-opacity="0.7"/>
      <text x="40" y="31" fill="#7a9ab8" font-size="9"
        style="font-family:'Share Tech Mono'">Suspicious access path</text>
    </g>
  `;

  svg.setAttribute('viewBox', '0 0 600 340');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.overflow = 'visible';

  svg.innerHTML = `
    <defs>
      <!-- Background subtle grid -->
      <pattern id="navGrid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none"
          stroke="rgba(0,212,255,0.04)" stroke-width="0.5"/>
      </pattern>

      <!-- Arrowhead markers -->
      <marker id="arrowCyan" markerWidth="7" markerHeight="7"
        refX="6" refY="3.5" orient="auto">
        <polygon points="0 0, 7 3.5, 0 7"
          fill="#00D4FF" fill-opacity="0.6"/>
      </marker>
      <marker id="arrowRed" markerWidth="7" markerHeight="7"
        refX="6" refY="3.5" orient="auto">
        <polygon points="0 0, 7 3.5, 0 7"
          fill="#ff3b5c" fill-opacity="0.7"/>
      </marker>
    </defs>

    <!-- Grid background -->
    <rect width="600" height="340" fill="url(#navGrid)"/>

    ${edgesHTML}
    ${nodesHTML}
    ${legendHTML}
  `;

  /* ── Animate: pulse the node rings ── */
  let phase = 0;
  function pulseRings() {
    phase += 0.04;
    svg.querySelectorAll('.node-ring').forEach((ring, i) => {
      const scale = 1 + 0.08 * Math.sin(phase + i * 0.9);
      ring.setAttribute('r', ((R + 8) * scale).toFixed(2));
      ring.setAttribute('stroke-opacity', (0.1 + 0.1 * Math.sin(phase + i * 0.9)).toFixed(3));
    });
    requestAnimationFrame(pulseRings);
  }
  pulseRings();
}

/* ============================================================
   SCORECARD
============================================================ */
function renderScorecard() {
  const tbody = document.getElementById('scorecardBody');
  if (!tbody) return;

  const sorted = [...APP.employees].sort((a, b) => b.riskScore - a.riskScore).slice(0, 12);

  tbody.innerHTML = sorted.map(emp => {
    const trend = Math.random() > 0.5 ? '↑' : '↓';
    const trendColor = (trend === '↑' && emp.risk !== 'low') ? 'var(--red)' : 'var(--green)';
    return `
      <tr>
        <td>
          <div class="employee-info">
            <div class="employee-avatar">${emp.initials}</div>
            <div>
              <div class="employee-name">${emp.name}</div>
              <div class="employee-id">${emp.id}</div>
            </div>
          </div>
        </td>
        <td>${emp.dept}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1;height:4px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden">
              <div style="width:${emp.riskScore}%;height:100%;background:${emp.risk==='high'?'var(--red)':emp.risk==='medium'?'var(--amber)':'var(--green)'};border-radius:2px"></div>
            </div>
            <span class="mono" style="font-size:11px;color:${emp.risk==='high'?'var(--red)':emp.risk==='medium'?'var(--amber)':'var(--green)'}">${emp.riskScore}</span>
          </div>
        </td>
        <td class="mono" style="font-size:11px">${emp.events.toLocaleString()}</td>
        <td style="color:${trendColor};font-size:16px">${trend}</td>
        <td><span class="risk-badge ${emp.risk}">${emp.risk.toUpperCase()}</span></td>
      </tr>
    `;
  }).join('');
}

/* ============================================================
   REAL-TIME SIMULATIONS
============================================================ */
function simulateNewActivity() {
  if (APP.activityLog.length === 0) return;

  const emp = APP.employees[Math.floor(Math.random() * APP.employees.length)];
  const types = ['login', 'file', 'file', 'alert'];
  const type = types[Math.floor(Math.random() * types.length)];
  const actions = ACTIONS[type] || ACTIONS.file;
  const action = actions[Math.floor(Math.random() * actions.length)];

  const newEntry = { emp, type, action, minsAgo: 0, risk: emp.risk };
  APP.activityLog.unshift(newEntry);
  if (APP.activityLog.length > 50) APP.activityLog.pop();

  renderFilteredLog(APP.activityFilter);

  // Update badge
  const badge = document.getElementById('activityBadge');
  if (badge) {
    badge.style.transform = 'scale(1.3)';
    setTimeout(() => { badge.style.transform = ''; }, 300);
  }
}

function simulateNewAlert() {
  if (Math.random() > 0.5) return; // 50% chance
  const types = ALERT_TYPES;
  const newAlert = {
    ...types[Math.floor(Math.random() * types.length)],
    id: `INC-${5000 + APP.alerts.length}`,
    user: APP.employees[Math.floor(Math.random() * 5)].name,
    timestamp: 'Just now',
    resolved: false,
  };

  APP.alerts.unshift(newAlert);
  renderAlertsList(APP.alerts);

  // Update count
  const count = document.getElementById('alertCount');
  if (count) count.textContent = parseInt(count.textContent || '0') + 1;

  showToast(`New ${newAlert.severity.toUpperCase()} alert: ${newAlert.title}`, newAlert.severity === 'critical' ? 'error' : 'warning');
}

function updateKPICounters() {
  const kpiActive = document.getElementById('kpiActiveUsers');
  const kpiAlerts = document.getElementById('kpiAlerts');
  const kpiSessions = document.getElementById('kpiSessions');

  if (kpiActive) {
    const current = parseInt(kpiActive.textContent.replace(',', ''));
    kpiActive.textContent = (current + Math.floor(Math.random() * 5) - 2).toLocaleString();
  }
  if (kpiSessions) {
    const current = parseInt(kpiSessions.textContent.replace(',', ''));
    kpiSessions.textContent = (current + Math.floor(Math.random() * 10)).toLocaleString();
  }
}

/* ============================================================
   NAVIGATION
============================================================ */
function switchView(viewId, navEl) {
  // Deactivate current view
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Activate new view
  const view = document.getElementById(viewId);
  if (view) view.classList.add('active');
  if (navEl) navEl.classList.add('active');

  APP.currentView = viewId;

  // Update topbar title
  const titles = {
    dashboardView: 'Dashboard Overview',
    activityView: 'Activity Monitor',
    alertsView: 'Security Alerts',
    reportsView: 'Analytics & Reports',
    settingsView: 'System Settings',
  };
  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = titles[viewId] || '';

  // Re-render charts when switching to reports
  if (viewId === 'reportsView') {
    setTimeout(() => {
      drawTrendChart();
      drawBehaviorRadar(0);
      drawDeptRiskChart();
    }, 100);
  }

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }

  return false;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

/* ============================================================
   MODALS
============================================================ */
function showEmployeeModal(empId) {
  const emp = APP.employees.find(e => e.id === empId);
  if (!emp) return;

  document.getElementById('modalTitle').textContent = `EMPLOYEE PROFILE — ${emp.id}`;
  document.getElementById('modalBody').innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
      <div class="employee-avatar" style="width:48px;height:48px;font-size:18px">${emp.initials}</div>
      <div>
        <div style="font-size:18px;font-weight:700;color:var(--text-primary)">${emp.name}</div>
        <div style="color:var(--text-muted);font-size:12px">${emp.dept} · ${emp.id}</div>
      </div>
      <span class="risk-badge ${emp.risk}" style="margin-left:auto">${emp.risk.toUpperCase()} RISK</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      ${[
        { label: 'STATUS', val: `<span class="status-badge ${emp.status}">${emp.status}</span>` },
        { label: 'RISK SCORE', val: `<span style="color:${emp.risk==='high'?'var(--red)':emp.risk==='medium'?'var(--amber)':'var(--green)'};">${emp.riskScore} / 100</span>` },
        { label: 'LOGIN TIME', val: emp.loginTime },
        { label: 'SESSION DURATION', val: emp.session },
        { label: 'DEVICE', val: emp.device },
        { label: 'EVENTS TODAY', val: emp.events.toLocaleString() },
      ].map(f => `
        <div class="modal-field">
          <span class="modal-field-label">${f.label}</span>
          <span class="modal-field-val">${f.val}</span>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:16px;padding:12px;background:rgba(0,212,255,0.04);border:1px solid var(--border);border-radius:8px">
      <div class="modal-field-label" style="margin-bottom:8px">RECENT ACTIVITY</div>
      ${Array.from({length:3}, (_, i) => {
        const actions = Object.values(ACTIONS).flat();
        return `<div style="font-size:11px;color:var(--text-secondary);padding:6px 0;border-bottom:1px solid rgba(0,212,255,0.04)">${getRelativeTime((i+1)*15)} — ${actions[Math.floor(Math.random()*actions.length)]}</div>`;
      }).join('')}
    </div>
  `;

  document.getElementById('modalOverlay').classList.add('active');
}

function showAlertModal(alertId) {
  const alert = APP.alerts.find(a => a.id === alertId);
  if (!alert) return;

  document.getElementById('modalTitle').textContent = `INCIDENT — ${alert.id}`;
  document.getElementById('modalBody').innerHTML = `
    <div style="margin-bottom:16px">
      <span class="sev-badge ${alert.severity}" style="margin-bottom:8px;display:inline-block">${alert.severity.toUpperCase()}</span>
      <div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:8px">${alert.title}</div>
      <div style="font-size:13px;color:var(--text-secondary)">${alert.desc}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      ${[
        { label: 'INCIDENT ID', val: alert.id },
        { label: 'AFFECTED USER', val: alert.user },
        { label: 'DETECTED', val: alert.timestamp },
        { label: 'STATUS', val: alert.resolved ? '<span style="color:var(--green)">RESOLVED</span>' : '<span style="color:var(--red)">OPEN</span>' },
      ].map(f => `
        <div class="modal-field">
          <span class="modal-field-label">${f.label}</span>
          <span class="modal-field-val">${f.val}</span>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:16px;display:flex;gap:10px">
      <button class="save-btn" style="margin:0" onclick="showToast('Incident marked as resolved','success');closeModal()">MARK RESOLVED</button>
      <button class="save-btn" style="margin:0;background:rgba(255,59,92,0.1);border-color:rgba(255,59,92,0.3);color:var(--red)" onclick="showToast('Escalated to security team','warning');closeModal()">ESCALATE</button>
    </div>
  `;

  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

/* ============================================================
   TOAST NOTIFICATIONS
============================================================ */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span style="font-size:14px">${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ============================================================
   WINDOW RESIZE HANDLER
============================================================ */
window.addEventListener('resize', () => {
  if (APP.currentView === 'dashboardView') {
    drawPulseChart();
  } else if (APP.currentView === 'reportsView') {
    drawTrendChart();
    drawBehaviorRadar(0);
    drawDeptRiskChart();
  }
});

/* ============================================================
   KEYBOARD SHORTCUTS
============================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initLogin();

  // Allow Enter key on login
  document.getElementById('accessCode')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('employeeId')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('accessCode')?.focus();
  });
});

/* ============================================================
   PDF EXPORT SYSTEM
   Uses browser window.print() with a fully styled print area.
   User selects "Save as PDF" in the print dialog.
============================================================ */

/**
 * Opens the PDF export modal
 */
function showPdfModal() {
  document.getElementById('pdfModalOverlay').classList.add('active');
}

/**
 * Closes the PDF export modal
 */
function closePdfModal() {
  document.getElementById('pdfModalOverlay').classList.remove('active');
}

/**
 * Handles report type card selection styling
 */
function selectReportType(radio) {
  // Remove active from all cards
  document.querySelectorAll('.pdf-type-card').forEach(card => card.classList.remove('active'));
  // Add active to selected card's parent label
  radio.closest('.pdf-type-card').classList.add('active');

  // Auto-check relevant sections based on type
  const type = radio.value;
  const checks = {
    full:      { kpi: true,  employees: true,  alerts: true,  risk: true,  stability: true,  footprints: false },
    alerts:    { kpi: false, employees: false,  alerts: true,  risk: true,  stability: false, footprints: false },
    employees: { kpi: false, employees: true,   alerts: false, risk: true,  stability: false, footprints: true  },
    executive: { kpi: true,  employees: false,  alerts: false, risk: true,  stability: true,  footprints: false },
  };

  const cfg = checks[type] || checks.full;
  Object.keys(cfg).forEach(key => {
    const el = document.getElementById('inc-' + key);
    if (el) el.checked = cfg[key];
  });
}

/**
 * Generates the PDF content and triggers the browser print dialog
 */
function generatePDF() {
  // Gather options
  const title    = document.getElementById('pdfTitle').value || 'SENTINEL Security Report';
  const author   = document.getElementById('pdfAuthor').value || 'Security Admin';
  const classif  = document.getElementById('pdfClass').value || 'CONFIDENTIAL';
  const period   = document.getElementById('pdfPeriod').value || 'Last 24 Hours';
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr  = now.toLocaleTimeString('en-IN', { hour12: false });

  const incKpi        = document.getElementById('inc-kpi').checked;
  const incEmployees  = document.getElementById('inc-employees').checked;
  const incAlerts     = document.getElementById('inc-alerts').checked;
  const incRisk       = document.getElementById('inc-risk').checked;
  const incStability  = document.getElementById('inc-stability').checked;
  const incFootprints = document.getElementById('inc-footprints').checked;

  // Close modal
  closePdfModal();
  showToast('Generating PDF report...', 'info');

  // Build HTML content
  let html = `
    <div class="pdf-doc">

      <!-- HEADER -->
      <div class="pdf-header">
        <div class="pdf-header-left">
          <h1>⬡ SENTINEL</h1>
          <div class="pdf-subtitle">SMART EMPLOYEE ACTIVITY MONITORING SYSTEM</div>
          <div style="margin-top:12px;font-size:13px;color:rgba(255,255,255,0.9);font-weight:600">${title}</div>
        </div>
        <div class="pdf-header-right">
          <div class="pdf-classification">${classif}</div>
          <div class="pdf-header-meta">
            <strong>Generated:</strong> ${dateStr} at ${timeStr}<br/>
            <strong>Prepared by:</strong> ${author}<br/>
            <strong>Period:</strong> ${period}<br/>
            <strong>Report ID:</strong> RPT-${Math.floor(Math.random()*90000)+10000}
          </div>
        </div>
      </div>
      <div class="pdf-divider"></div>

      <div class="pdf-content">
  `;

  // ---- KPI SECTION ----
  if (incKpi) {
    const activeUsers = document.getElementById('kpiActiveUsers')?.textContent || '247';
    const alerts      = document.getElementById('kpiAlerts')?.textContent || '18';
    const sessions    = document.getElementById('kpiSessions')?.textContent || '1,842';
    const stability   = document.getElementById('kpiStability')?.textContent || '94.2';

    html += `
      <div class="pdf-section">
        <div class="pdf-section-title">📊 Executive KPI Summary</div>
        <div class="pdf-kpi-grid">
          <div class="pdf-kpi-card">
            <div class="pdf-kpi-val cyan">${activeUsers}</div>
            <div class="pdf-kpi-label">Active Users</div>
            <div class="pdf-kpi-delta pos">↑ 12 from yesterday</div>
          </div>
          <div class="pdf-kpi-card">
            <div class="pdf-kpi-val red">${alerts}</div>
            <div class="pdf-kpi-label">Active Alerts</div>
            <div class="pdf-kpi-delta neg">↑ 5 new today</div>
          </div>
          <div class="pdf-kpi-card">
            <div class="pdf-kpi-val amber">${sessions}</div>
            <div class="pdf-kpi-label">Sessions Today</div>
            <div class="pdf-kpi-delta pos">↑ 8.3% vs avg</div>
          </div>
          <div class="pdf-kpi-card">
            <div class="pdf-kpi-val green">${stability}</div>
            <div class="pdf-kpi-label">Stability Index</div>
            <div class="pdf-kpi-delta pos">↑ 1.8 pts</div>
          </div>
        </div>
      </div>
    `;
  }

  // ---- RISK DISTRIBUTION ----
  if (incRisk) {
    html += `
      <div class="pdf-section">
        <div class="pdf-section-title">🎯 Risk Distribution</div>
        <div class="pdf-risk-summary">
          <div class="pdf-risk-item low">
            <div class="pdf-risk-pct">73%</div>
            <div class="pdf-risk-label">LOW RISK</div>
          </div>
          <div class="pdf-risk-item medium">
            <div class="pdf-risk-pct">19%</div>
            <div class="pdf-risk-label">MEDIUM RISK</div>
          </div>
          <div class="pdf-risk-item high">
            <div class="pdf-risk-pct">8%</div>
            <div class="pdf-risk-label">HIGH RISK</div>
          </div>
        </div>
      </div>
    `;
  }

  // ---- STABILITY INDEX ----
  if (incStability) {
    html += `
      <div class="pdf-section">
        <div class="pdf-section-title">🛡️ Information Flow Stability Index</div>
        <div class="pdf-stability-block">
          <div>
            <div class="pdf-metric">
              <div class="pdf-metric-label">Overall Stability Score</div>
              <div class="pdf-metric-bar-wrap"><div class="pdf-metric-bar" style="width:94.2%"></div></div>
              <div class="pdf-metric-val">94.2 / 100 — STABLE</div>
            </div>
            <div class="pdf-metric" style="margin-top:12px">
              <div class="pdf-metric-label">Data Integrity</div>
              <div class="pdf-metric-bar-wrap"><div class="pdf-metric-bar" style="width:96%"></div></div>
              <div class="pdf-metric-val">96%</div>
            </div>
            <div class="pdf-metric" style="margin-top:12px">
              <div class="pdf-metric-label">Access Control</div>
              <div class="pdf-metric-bar-wrap"><div class="pdf-metric-bar" style="width:88%"></div></div>
              <div class="pdf-metric-val">88%</div>
            </div>
          </div>
          <div>
            <div class="pdf-metric">
              <div class="pdf-metric-label">Behavior Norm Compliance</div>
              <div class="pdf-metric-bar-wrap"><div class="pdf-metric-bar amber" style="width:74%"></div></div>
              <div class="pdf-metric-val">74% — Moderate</div>
            </div>
            <div class="pdf-metric" style="margin-top:12px">
              <div class="pdf-metric-label">System Uptime</div>
              <div class="pdf-metric-bar-wrap"><div class="pdf-metric-bar" style="width:99.9%"></div></div>
              <div class="pdf-metric-val">99.9%</div>
            </div>
            <div class="pdf-metric" style="margin-top:12px">
              <div class="pdf-metric-label">Avg Network Latency</div>
              <div class="pdf-metric-bar-wrap"><div class="pdf-metric-bar" style="width:85%"></div></div>
              <div class="pdf-metric-val">98.7ms — Normal</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ---- EMPLOYEE TABLE ----
  if (incEmployees && APP.employees.length > 0) {
    const rows = APP.employees.slice(0, 15).map(emp => `
      <tr>
        <td><strong>${emp.name}</strong><br/><span style="font-size:10px;color:#a0aec0">${emp.id}</span></td>
        <td>${emp.dept}</td>
        <td>${emp.loginTime}</td>
        <td>${emp.session}</td>
        <td>${emp.device}</td>
        <td><span class="pdf-badge ${emp.risk}">${emp.risk.toUpperCase()}</span></td>
        <td>${emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}</td>
        <td><strong style="color:${emp.risk==='high'?'#e53e3e':emp.risk==='medium'?'#d69e2e':'#2f855a'}">${emp.riskScore}</strong></td>
      </tr>
    `).join('');

    html += `
      <div class="pdf-section">
        <div class="pdf-section-title">👥 Employee Activity Monitor (Top 15)</div>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>DEPARTMENT</th>
              <th>LOGIN</th>
              <th>SESSION</th>
              <th>DEVICE</th>
              <th>RISK LEVEL</th>
              <th>STATUS</th>
              <th>SCORE</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  // ---- ALERTS SECTION ----
  if (incAlerts && APP.alerts.length > 0) {
    const alertItems = APP.alerts.slice(0, 8).map(a => `
      <div class="pdf-alert-item ${a.severity}">
        <div style="flex:1">
          <div class="pdf-alert-title">
            <span class="pdf-badge ${a.severity}">${a.severity.toUpperCase()}</span>
            &nbsp;${a.title}
          </div>
          <div class="pdf-alert-desc">${a.desc}</div>
          <div class="pdf-alert-meta">
            👤 ${a.user} &nbsp;|&nbsp; 🕐 ${a.timestamp} &nbsp;|&nbsp; ID: ${a.id}
            ${a.resolved ? ' &nbsp;|&nbsp; ✅ RESOLVED' : ' &nbsp;|&nbsp; 🔴 OPEN'}
          </div>
        </div>
      </div>
    `).join('');

    html += `
      <div class="pdf-section">
        <div class="pdf-section-title">⚠️ Security Incidents (Last 8)</div>
        ${alertItems}
      </div>
    `;
  }

  // ---- ACCESS FOOTPRINTS ----
  if (incFootprints) {
    const footprintData = [
      { user: 'Arjun Kumar',  action: 'Accessed payroll module',    path: '/hr/payroll/2024/',        risk: 'high',   time: '02:47' },
      { user: 'Priya Sharma', action: 'Downloaded bulk records',    path: '/data/client_export.csv',  risk: 'high',   time: '08:12' },
      { user: 'Ravi Patel',   action: 'Modified config file',       path: '/system/config.json',      risk: 'medium', time: '09:35' },
      { user: 'Rohit Reddy',  action: 'Accessed restricted dir',    path: '/admin/restricted/',       risk: 'high',   time: '13:44' },
      { user: 'Sanjay Rao',   action: 'Off-hours file transfer',    path: '/uploads/external/',       risk: 'high',   time: '23:17' },
    ];

    const fpRows = footprintData.map(f => `
      <tr>
        <td>${f.time}</td>
        <td><strong>${f.user}</strong></td>
        <td>${f.action}</td>
        <td style="font-family:monospace;font-size:10px;color:#0987a0">${f.path}</td>
        <td><span class="pdf-badge ${f.risk}">${f.risk.toUpperCase()}</span></td>
      </tr>
    `).join('');

    html += `
      <div class="pdf-section">
        <div class="pdf-section-title">🔍 Invisible Access Footprints</div>
        <table class="pdf-table">
          <thead>
            <tr><th>TIME</th><th>EMPLOYEE</th><th>ACTION</th><th>PATH</th><th>RISK</th></tr>
          </thead>
          <tbody>${fpRows}</tbody>
        </table>
      </div>
    `;
  }

  // Close content div
  html += `</div>`;

  // ---- FOOTER ----
  html += `
    <div class="pdf-footer">
      <div class="pdf-footer-left">
        SENTINEL v4.2.1 &nbsp;|&nbsp; ${classif} &nbsp;|&nbsp; Do not distribute without authorization
      </div>
      <div class="pdf-footer-right">
        Generated: ${dateStr} ${timeStr}<br/>
        © 2025 SENTINEL Corp. All rights reserved.
      </div>
    </div>
    </div>
  `;

  // Inject into print area and print
  const printArea = document.getElementById('pdfPrintArea');
  printArea.innerHTML = html;
  printArea.style.display = 'block';

  setTimeout(() => {
    window.print();

    // After print dialog closes, hide the area again
    setTimeout(() => {
      printArea.style.display = 'none';
      showToast('PDF report generated successfully!', 'success');
    }, 1000);
  }, 300);
}