/**
 * SentinelCore — Employee Activity Monitoring System
 * script.js
 *
 * Vanilla JS | Modular | Production-ready
 * All data is mocked. Replace API_* functions to connect a real backend.
 */

'use strict';

/* ═══════════════════════════════════════════
   MOCK DATA STORE
   Replace with API calls in production
   ═══════════════════════════════════════════ */
const MOCK = {
  employees: [
    { id:'EMP-10041', name:'Aidan Clarke',    dept:'Engineering', status:'online',  lastAction:'Accessed GitHub repo',     risk:12, time:'09:14', login:'08:52', logout:'—',     device:'MacBook Pro', location:'London, UK',    behavior:'normal' },
    { id:'EMP-10078', name:'Priya Nair',      dept:'Finance',     status:'online',  lastAction:'Exported financial report', risk:78, time:'09:18', login:'08:30', logout:'—',     device:'Windows PC',  location:'Mumbai, IN',    behavior:'critical' },
    { id:'EMP-10094', name:'James Whitfield', dept:'IT',          status:'idle',    lastAction:'VPN disconnected',         risk:45, time:'08:55', login:'08:00', logout:'—',     device:'Linux WS',    location:'New York, US',  behavior:'warning' },
    { id:'EMP-10112', name:'Sofia Reyes',     dept:'HR',          status:'online',  lastAction:'Viewed employee profiles', risk:8,  time:'09:20', login:'09:05', logout:'—',     device:'MacBook Air', location:'Madrid, ES',    behavior:'normal' },
    { id:'EMP-10156', name:'Marcus Chen',     dept:'Sales',       status:'offline', lastAction:'File transfer 2.3GB',      risk:91, time:'07:42', login:'06:30', logout:'07:42', device:'Windows PC',  location:'Singapore, SG', behavior:'critical' },
    { id:'EMP-10183', name:'Lena Bauer',      dept:'Engineering', status:'online',  lastAction:'Code deployment',          risk:5,  time:'09:22', login:'09:00', logout:'—',     device:'MacBook Pro', location:'Berlin, DE',    behavior:'normal' },
    { id:'EMP-10201', name:'David Okafor',    dept:'Finance',     status:'online',  lastAction:'Database query (unusual)', risk:63, time:'09:01', login:'08:15', logout:'—',     device:'Windows PC',  location:'Lagos, NG',     behavior:'warning' },
    { id:'EMP-10229', name:'Yuki Tanaka',     dept:'IT',          status:'online',  lastAction:'Admin privileges elevated',risk:85, time:'08:48', login:'08:00', logout:'—',     device:'Linux WS',    location:'Tokyo, JP',     behavior:'critical' },
    { id:'EMP-10247', name:'Rachel Moore',    dept:'Sales',       status:'idle',    lastAction:'Email sent (bulk)',        risk:22, time:'08:40', login:'08:30', logout:'—',     device:'MacBook Air', location:'Chicago, US',   behavior:'normal' },
    { id:'EMP-10265', name:'Omar Farouk',     dept:'HR',          status:'online',  lastAction:'Accessed payroll data',   risk:55, time:'09:10', login:'08:45', logout:'—',     device:'Windows PC',  location:'Dubai, AE',     behavior:'warning' },
  ],

  alerts: [
    { id:'ALT-001', title:'Unauthorized Data Export', desc:'Large file transfer detected outside business hours.', emp:'EMP-10156 · Marcus Chen', time:'07:42', severity:'critical' },
    { id:'ALT-002', title:'Privilege Escalation',     desc:'Admin rights elevated without IT approval ticket.',   emp:'EMP-10229 · Yuki Tanaka', time:'08:48', severity:'high' },
    { id:'ALT-003', title:'Abnormal DB Query Volume', desc:'500+ database queries in 10 minutes — Finance DB.',   emp:'EMP-10078 · Priya Nair',   time:'09:02', severity:'high' },
    { id:'ALT-004', title:'VPN Anomaly Detected',     desc:'Multiple failed VPN attempts from unknown IP.',       emp:'EMP-10094 · James Whitfield', time:'08:55', severity:'medium' },
    { id:'ALT-005', title:'Bulk Email Trigger',        desc:'300+ emails sent in 5 minutes — possible breach.',   emp:'EMP-10247 · Rachel Moore',  time:'08:41', severity:'medium' },
    { id:'ALT-006', title:'Payroll Data Access',       desc:'HR employee accessed payroll outside working scope.', emp:'EMP-10265 · Omar Farouk',   time:'09:10', severity:'medium' },
    { id:'ALT-007', title:'New Admin Account Created', desc:'Unscheduled admin account added to system.',          emp:'EMP-10229 · Yuki Tanaka',   time:'07:30', severity:'critical' },
    { id:'ALT-008', title:'Login from Unknown Device', desc:'Session from unregistered device fingerprint.',       emp:'EMP-10201 · David Okafor',  time:'08:18', severity:'high' },
    { id:'ALT-009', title:'Repeated Auth Failures',    desc:'12 failed login attempts detected in 2 minutes.',    emp:'EMP-10094 · James Whitfield', time:'08:02', severity:'medium' },
    { id:'ALT-010', title:'File Encryption Activity',  desc:'Unexpected encryption of local documents folder.',   emp:'EMP-10156 · Marcus Chen',   time:'07:15', severity:'critical' },
  ]
};

/* ═══════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════ */
/**
 * Pad a number with leading zero
 * @param {number} n
 * @returns {string}
 */
const pad = n => String(n).padStart(2, '0');

/**
 * Format current datetime as a readable string
 * @returns {string}
 */
function formatDatetime() {
  const now = new Date();
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${days[now.getDay()]} ${pad(now.getDate())} ${months[now.getMonth()]} ${now.getFullYear()}  ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/**
 * Show a toast notification
 * @param {string} message
 * @param {'info'|'success'|'error'} type
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

/* ═══════════════════════════════════════════
   DEVICE DETECTION
   ═══════════════════════════════════════════ */
function detectDevice() {
  const ua = navigator.userAgent;

  // Detect OS
  let os = 'Unknown OS';
  if (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';

  // Detect Browser
  let browser = 'Unknown';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua)) browser = 'Safari';
  else if (/OPR\//.test(ua)) browser = 'Opera';

  // Detect Device type
  let device = 'Desktop';
  if (/Mobi|Android/i.test(ua)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

  return { os, browser, device };
}

/* ═══════════════════════════════════════════
   CLOCK — Real-time updates
   ═══════════════════════════════════════════ */
function startClock() {
  function tick() {
    const str = formatDatetime();
    const el1 = document.getElementById('login-datetime');
    const el2 = document.getElementById('header-datetime');
    if (el1) el1.textContent = str;
    if (el2) el2.textContent = str;
  }
  tick();
  setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════
   LOGIN PAGE INIT
   ═══════════════════════════════════════════ */
function initLogin() {
  // Device detection
  const { os, browser, device } = detectDevice();
  document.getElementById('dinfo-os').textContent      = os;
  document.getElementById('dinfo-browser').textContent = browser;
  document.getElementById('dinfo-device').textContent  = device;

  // Animate side stats bars on load
  setTimeout(() => {
    document.querySelectorAll('.side-stat-fill').forEach(el => {
      const w = el.style.width;
      el.style.width = '0';
      setTimeout(() => { el.style.width = w; }, 50);
    });
  }, 400);

  // Login form
  const form = document.getElementById('login-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const empId = document.getElementById('employee-id').value.trim();
    const pass  = document.getElementById('password').value.trim();

    if (!empId || !pass) {
      showToast('Please enter your Employee ID and Access Code.', 'error');
      return;
    }

    // Simulate loading state
    const btn = form.querySelector('.login-btn');
    const origHTML = btn.innerHTML;
    btn.innerHTML = '<span class="btn-text">AUTHENTICATING...</span>';
    btn.style.opacity = '0.7';
    btn.disabled = true;

    // Simulate API delay (replace with real fetch)
    setTimeout(() => {
      btn.innerHTML = origHTML;
      btn.style.opacity = '';
      btn.disabled = false;
      transitionToApp();
    }, 1400);
  });
}

/* ═══════════════════════════════════════════
   PAGE TRANSITION
   ═══════════════════════════════════════════ */
function transitionToApp() {
  const loginPage = document.getElementById('login-page');
  const appPage   = document.getElementById('app-page');

  loginPage.style.opacity = '0';
  loginPage.style.transition = 'opacity 0.5s ease';

  setTimeout(() => {
    loginPage.classList.remove('active');
    appPage.classList.add('active');
    appPage.style.opacity = '0';
    appPage.style.transition = 'opacity 0.5s ease';
    setTimeout(() => { appPage.style.opacity = '1'; }, 50);
    initApp();
  }, 500);
}

/* ═══════════════════════════════════════════
   APP INIT
   ═══════════════════════════════════════════ */
function initApp() {
  initNavigation();
  initDashboard();
  initActivityMonitor();
  initAlerts();
  initSettings();
  showToast('Welcome back, Admin. System operational.', 'success');
}

/* ═══════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════ */
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.content-section');
  const sectionTitle = document.getElementById('header-section-title');

  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const target = item.dataset.section;

      // Update nav active
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Update sections
      sections.forEach(s => s.classList.remove('active'));
      const activeSection = document.getElementById(`section-${target}`);
      if (activeSection) activeSection.classList.add('active');

      // Update header title
      sectionTitle.textContent = item.querySelector('.nav-label').textContent;
    });
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('End session and return to login?')) {
      const appPage = document.getElementById('app-page');
      const loginPage = document.getElementById('login-page');
      appPage.classList.remove('active');
      loginPage.classList.add('active');
      loginPage.style.opacity = '';
    }
  });

  // Sidebar toggle (mobile)
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

/* ═══════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════ */
function initDashboard() {
  renderActivityTable();
  renderDashboardAlerts();
  drawTrendChart();
  drawRiskChart();
  startLiveSimulation();
}

/** Render the main activity log table */
function renderActivityTable() {
  const tbody = document.getElementById('activity-table-body');
  tbody.innerHTML = '';

  MOCK.employees.forEach((emp, i) => {
    const riskClass = emp.risk >= 70 ? 'high' : emp.risk >= 40 ? 'medium' : 'low';
    const riskLabel = emp.risk >= 70 ? 'HIGH' : emp.risk >= 40 ? 'MED' : 'LOW';
    const statusClass = emp.status === 'online' ? 'status-online' : emp.status === 'idle' ? 'status-idle' : 'status-offline';

    const tr = document.createElement('tr');
    tr.style.animationDelay = `${i * 0.05}s`;
    tr.innerHTML = `
      <td>${emp.name}</td>
      <td>${emp.dept}</td>
      <td><span class="status-badge ${statusClass}">
        <span class="dot dot-${emp.status === 'online' ? 'green' : emp.status === 'idle' ? 'yellow' : ''} pulse"></span>
        ${emp.status}
      </span></td>
      <td>${emp.lastAction}</td>
      <td><span class="risk-badge risk-${riskClass}">${riskLabel} · ${emp.risk}</span></td>
      <td class="mono-text">${emp.time}</td>
    `;
    tbody.appendChild(tr);
  });
}

/** Render dashboard alert panel */
function renderDashboardAlerts() {
  const list = document.getElementById('dashboard-alert-list');
  list.innerHTML = '';
  const displayAlerts = MOCK.alerts.slice(0, 6);

  displayAlerts.forEach((alert, i) => {
    const div = document.createElement('div');
    div.className = `alert-item sev-${alert.severity}`;
    div.style.animationDelay = `${i * 0.08}s`;
    div.innerHTML = `
      <div class="alert-item-header">
        <span class="alert-item-title">${alert.title}</span>
        <span class="alert-item-time">${alert.time}</span>
      </div>
      <div class="alert-item-desc">${alert.desc}</div>
      <div class="alert-item-emp">↳ ${alert.emp}</div>
    `;
    list.appendChild(div);
  });
}

/* ═══════════════════════════════════════════
   CHARTS (Pure Canvas — no libraries)
   ═══════════════════════════════════════════ */

/** Activity Trend Line Chart */
function drawTrendChart() {
  const canvas = document.getElementById('trend-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // High-DPI
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width  = rect.width * window.devicePixelRatio;
  canvas.height = 180 * window.devicePixelRatio;
  canvas.style.width  = '100%';
  canvas.style.height = '180px';
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const W = rect.width;
  const H = 180;

  const data = {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    normal: [180, 210, 195, 230, 215, 90, 70],
    alerts: [12,  18,  15,  25,  22,  8,  5],
  };

  const max = Math.max(...data.normal) * 1.2;
  const padL = 40, padR = 20, padT = 20, padB = 36;
  const cW = W - padL - padR;
  const cH = H - padT - padB;
  const stepX = cW / (data.labels.length - 1);

  // Grid lines
  ctx.strokeStyle = 'rgba(0,212,255,0.07)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (cH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(139,163,199,0.5)';
    ctx.font = '10px IBM Plex Mono';
    ctx.fillText(Math.round(max - (max / 4) * i), 4, y + 4);
  }

  // Normal activity area fill
  const gradFill = ctx.createLinearGradient(0, padT, 0, padT + cH);
  gradFill.addColorStop(0, 'rgba(0,212,255,0.25)');
  gradFill.addColorStop(1, 'rgba(0,212,255,0.01)');

  ctx.beginPath();
  data.normal.forEach((val, i) => {
    const x = padL + i * stepX;
    const y = padT + cH - (val / max) * cH;
    if (i === 0) ctx.moveTo(x, y);
    else {
      // Smooth curve
      const prevX = padL + (i - 1) * stepX;
      const prevY = padT + cH - (data.normal[i - 1] / max) * cH;
      const cpX = (prevX + x) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
    }
  });
  ctx.lineTo(padL + (data.normal.length - 1) * stepX, padT + cH);
  ctx.lineTo(padL, padT + cH);
  ctx.closePath();
  ctx.fillStyle = gradFill;
  ctx.fill();

  // Normal activity line
  ctx.beginPath();
  ctx.strokeStyle = '#00D4FF';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#00D4FF';
  ctx.shadowBlur = 10;
  data.normal.forEach((val, i) => {
    const x = padL + i * stepX;
    const y = padT + cH - (val / max) * cH;
    if (i === 0) ctx.moveTo(x, y);
    else {
      const prevX = padL + (i - 1) * stepX;
      const prevY = padT + cH - (data.normal[i - 1] / max) * cH;
      const cpX = (prevX + x) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
    }
  });
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Alert dots
  data.alerts.forEach((val, i) => {
    const x = padL + i * stepX;
    const y = padT + cH - (val / max) * cH;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FF4D6D';
    ctx.shadowColor = '#FF4D6D';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // X labels
  ctx.fillStyle = 'rgba(139,163,199,0.7)';
  ctx.font = '11px IBM Plex Mono';
  ctx.textAlign = 'center';
  data.labels.forEach((label, i) => {
    const x = padL + i * stepX;
    ctx.fillText(label, x, H - 8);
  });

  // Data points on normal line
  data.normal.forEach((val, i) => {
    const x = padL + i * stepX;
    const y = padT + cH - (val / max) * cH;
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#040d1f';
    ctx.fill();
    ctx.strokeStyle = '#00D4FF';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

/** Risk Distribution Donut Chart */
function drawRiskChart() {
  const canvas = document.getElementById('risk-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const SIZE = 180;
  canvas.width  = SIZE * window.devicePixelRatio;
  canvas.height = SIZE * window.devicePixelRatio;
  canvas.style.width  = `${SIZE}px`;
  canvas.style.height = `${SIZE}px`;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const cx = SIZE / 2, cy = SIZE / 2, R = 68, r = 44;
  const slices = [
    { value: 68, color: '#00E5A0', glow: false },
    { value: 19, color: '#FFD166', glow: false },
    { value: 13, color: '#FF4D6D', glow: true  },
  ];
  const total = slices.reduce((s, sl) => s + sl.value, 0);

  let startAngle = -Math.PI / 2;

  slices.forEach(slice => {
    const angle = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = slice.color;

    if (slice.glow) {
      ctx.shadowColor = slice.color;
      ctx.shadowBlur = 20;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
    startAngle += angle;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#071228';
  ctx.fill();

  // Center text
  ctx.fillStyle = '#00D4FF';
  ctx.font = `bold 22px Orbitron, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RISK', cx, cy - 8);
  ctx.fillStyle = 'rgba(139,163,199,0.7)';
  ctx.font = `10px IBM Plex Mono`;
  ctx.fillText('DIST.', cx, cy + 10);
}

/* ═══════════════════════════════════════════
   LIVE SIMULATION
   Simulates real-time data changes
   ═══════════════════════════════════════════ */
function startLiveSimulation() {
  // Randomly update a KPI to simulate real-time
  setInterval(() => {
    const kpiActive = document.getElementById('kpi-active');
    if (kpiActive) {
      const base = 247;
      const variance = Math.floor(Math.random() * 10) - 5;
      kpiActive.textContent = (base + variance).toLocaleString();
    }
  }, 4000);

  // Add a random alert to the dashboard panel periodically
  let alertIndex = 6;
  setInterval(() => {
    if (alertIndex >= MOCK.alerts.length) alertIndex = 0;
    const alert = MOCK.alerts[alertIndex++];
    const list = document.getElementById('dashboard-alert-list');
    if (!list) return;

    const div = document.createElement('div');
    div.className = `alert-item sev-${alert.severity}`;
    div.innerHTML = `
      <div class="alert-item-header">
        <span class="alert-item-title">${alert.title}</span>
        <span class="alert-item-time">${formatDatetime().split('  ')[1].substring(0,5)}</span>
      </div>
      <div class="alert-item-desc">${alert.desc}</div>
      <div class="alert-item-emp">↳ ${alert.emp}</div>
    `;

    list.insertBefore(div, list.firstChild);
    if (list.children.length > 7) list.lastElementChild.remove();

    // Show toast for high/critical
    if (['critical','high'].includes(alert.severity)) {
      showToast(`⚡ ${alert.title} — ${alert.emp.split('·')[1]?.trim() || ''}`, 'error');
    }
  }, 12000);
}

/* ═══════════════════════════════════════════
   ACTIVITY MONITOR
   ═══════════════════════════════════════════ */
function initActivityMonitor() {
  renderActivityCards(MOCK.employees);

  document.getElementById('apply-filter').addEventListener('click', () => {
    const search = document.getElementById('activity-search').value.toLowerCase();
    const status = document.getElementById('activity-status-filter').value;
    const dept   = document.getElementById('activity-dept-filter').value;

    const filtered = MOCK.employees.filter(emp => {
      const matchSearch = !search ||
        emp.name.toLowerCase().includes(search) ||
        emp.id.toLowerCase().includes(search);
      const matchStatus = !status || emp.behavior === status;
      const matchDept   = !dept   || emp.dept === dept;
      return matchSearch && matchStatus && matchDept;
    });

    renderActivityCards(filtered);
    showToast(`Filter applied — ${filtered.length} records`, 'info');
  });
}

/** Generate a deterministic color from a string */
function strColor(str) {
  const colors = ['#00D4FF','#00E5A0','#FFD166','#A78BFA','#F472B6','#60A5FA'];
  let hash = 0;
  for (let c of str) hash = (hash * 31 + c.charCodeAt(0)) % colors.length;
  return colors[hash];
}

function renderActivityCards(employees) {
  const grid = document.getElementById('activity-cards-grid');
  grid.innerHTML = '';

  if (!employees.length) {
    grid.innerHTML = '<div style="color:var(--text-dim);padding:24px;font-size:0.85rem;">No records match your filter.</div>';
    return;
  }

  employees.forEach((emp, i) => {
    const card = document.createElement('div');
    card.className = 'activity-card glass-card';
    card.style.animationDelay = `${i * 0.06}s`;

    const initials = emp.name.split(' ').map(p => p[0]).join('');
    const avatarColor = strColor(emp.name);
    const behaviorClass = `behavior-${emp.behavior}`;
    const behaviorLabel = emp.behavior === 'normal' ? 'NORMAL' : emp.behavior === 'warning' ? 'WARNING' : '⚠ CRITICAL';
    const riskClass = emp.risk >= 70 ? 'high' : emp.risk >= 40 ? 'medium' : 'low';

    const warningHTML = emp.behavior === 'critical'
      ? `<div class="warning-strip">⚡ Abnormal behavior detected — Immediate review required</div>`
      : emp.behavior === 'warning'
        ? `<div class="warning-strip" style="border-color:rgba(255,209,102,0.2);color:var(--yellow);background:rgba(255,209,102,0.07);">⚠ Unusual activity pattern — Monitor closely</div>`
        : '';

    card.innerHTML = `
      <div class="activity-card-header">
        <div class="activity-emp-info">
          <div class="activity-avatar" style="background:${avatarColor}20;color:${avatarColor};border:1px solid ${avatarColor}30">${initials}</div>
          <div>
            <div class="activity-emp-name">${emp.name}</div>
            <div class="activity-emp-id">${emp.id}</div>
          </div>
        </div>
        <span class="risk-badge risk-${riskClass}">${emp.risk}</span>
      </div>
      <div class="activity-body">
        <div class="activity-row">
          <span class="activity-row-label">Department</span>
          <span class="activity-row-val">${emp.dept}</span>
        </div>
        <div class="activity-row">
          <span class="activity-row-label">Login Time</span>
          <span class="activity-row-val">${emp.login}</span>
        </div>
        <div class="activity-row">
          <span class="activity-row-label">Logout Time</span>
          <span class="activity-row-val">${emp.logout}</span>
        </div>
        <div class="activity-row">
          <span class="activity-row-label">Device</span>
          <span class="activity-row-val">${emp.device}</span>
        </div>
        <div class="activity-row">
          <span class="activity-row-label">Location</span>
          <span class="activity-row-val">${emp.location}</span>
        </div>
        <div class="activity-row">
          <span class="activity-row-label">Last Action</span>
          <span class="activity-row-val" style="max-width:160px;overflow:hidden;text-overflow:ellipsis;">${emp.lastAction}</span>
        </div>
      </div>
      ${warningHTML}
      <div class="activity-card-footer">
        <span class="behavior-badge ${behaviorClass}">${behaviorLabel}</span>
        <span class="status-badge ${emp.status === 'online' ? 'status-online' : emp.status === 'idle' ? 'status-idle' : 'status-offline'}">${emp.status}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ═══════════════════════════════════════════
   SECURITY ALERTS
   ═══════════════════════════════════════════ */
function initAlerts() {
  renderAlertsTimeline();
}

function renderAlertsTimeline() {
  const container = document.getElementById('alerts-timeline');
  container.innerHTML = '';

  const sevConfig = {
    critical: { label: 'CRITICAL', class: 'ta-sev-critical', labelStyle: 'background:rgba(255,77,109,0.15);color:#FF4D6D;' },
    high:     { label: 'HIGH',     class: 'ta-sev-high',     labelStyle: 'background:rgba(255,77,109,0.1);color:#FF4D6D;' },
    medium:   { label: 'MEDIUM',   class: 'ta-sev-medium',   labelStyle: 'background:rgba(255,209,102,0.1);color:#FFD166;' },
    low:      { label: 'LOW',      class: 'ta-sev-low',      labelStyle: 'background:rgba(0,229,160,0.1);color:#00E5A0;' },
  };

  MOCK.alerts.forEach((alert, i) => {
    const cfg = sevConfig[alert.severity];
    const div = document.createElement('div');
    div.className = 'timeline-alert glass-card';
    div.style.animationDelay = `${i * 0.07}s`;
    div.innerHTML = `
      <div class="ta-severity ${cfg.class}"></div>
      <div class="ta-body">
        <div class="ta-title">${alert.title}</div>
        <div class="ta-desc">${alert.desc}</div>
        <div class="ta-emp">↳ ${alert.emp}</div>
      </div>
      <div class="ta-meta">
        <div class="ta-time">${alert.time}</div>
        <span class="ta-sev-label" style="${cfg.labelStyle}">${cfg.label}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

/* ═══════════════════════════════════════════
   SETTINGS
   ═══════════════════════════════════════════ */
function initSettings() {
  // Range inputs live update
  ['high-threshold', 'med-threshold'].forEach(id => {
    const input = document.getElementById(id);
    const valEl = document.getElementById(`${id}-val`);
    if (!input || !valEl) return;
    input.addEventListener('input', () => { valEl.textContent = input.value; });
  });

  // Toggle switches
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
    });
  });
}

/* ═══════════════════════════════════════════
   RESIZE HANDLER
   ═══════════════════════════════════════════ */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Redraw charts on resize
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection && activeSection.id === 'section-dashboard') {
      drawTrendChart();
    }
  }, 200);
});

/* ═══════════════════════════════════════════
   ENTRY POINT
   ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  initLogin();
});