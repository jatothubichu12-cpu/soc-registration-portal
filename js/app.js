/* ==========================================================================
   app.js — shared behaviour used across every page of the SOC portal:
   page loader, nav toggle, toast notifications, animated counters,
   the hero "live feed" console, and the LocalStorage data layer.
   ========================================================================== */

const SOC_STORAGE_KEY = 'soc_registrations_v1';
const SOC_ADMIN_SESSION_KEY = 'soc_admin_session';

/* ---------------------------------------------------------------------
   Data layer — every page (register / admin / dashboard) reads and
   writes through these functions so the storage shape stays consistent.
--------------------------------------------------------------------- */
const SOCData = {
  getAll(){
    try{
      const raw = localStorage.getItem(SOC_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      console.error('Could not read registrations from storage', e);
      return [];
    }
  },
  saveAll(records){
    localStorage.setItem(SOC_STORAGE_KEY, JSON.stringify(records));
  },
  add(record){
    const all = this.getAll();
    record.id = this.nextId(all);
    record.createdAt = new Date().toISOString();
    all.push(record);
    this.saveAll(all);
    return record;
  },
  update(id, patch){
    const all = this.getAll();
    const idx = all.findIndex(r => r.id === id);
    if(idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    this.saveAll(all);
    return all[idx];
  },
  remove(id){
    const all = this.getAll().filter(r => r.id !== id);
    this.saveAll(all);
  },
  nextId(all){
    const max = all.reduce((m, r) => Math.max(m, r.id || 0), 0);
    return max + 1;
  },
  studentIdTag(id){
    return 'SOC-' + String(id).padStart(4, '0');
  }
};

/* ---------------------------------------------------------------------
   Page loader — hides itself once the DOM is painted.
--------------------------------------------------------------------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if(loader){
    setTimeout(() => loader.classList.add('done'), 350);
  }
});

/* ---------------------------------------------------------------------
   Mobile nav toggle
--------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if(toggle && links){
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
});

/* ---------------------------------------------------------------------
   Toast notifications
--------------------------------------------------------------------- */
function showToast(message, type = 'info', duration = 3800){
  let stack = document.getElementById('toast-stack');
  if(!stack){
    stack = document.createElement('div');
    stack.id = 'toast-stack';
    document.body.appendChild(stack);
  }
  const icons = { success:'fa-circle-check', error:'fa-triangle-exclamation', info:'fa-shield-halved' };
  const toast = document.createElement('div');
  toast.className = `toast glass ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 320);
  }, duration);
}

/* ---------------------------------------------------------------------
   Animated counters — any element with data-count="123"
--------------------------------------------------------------------- */
function animateCounters(root = document){
  const counters = root.querySelectorAll('[data-count]');
  counters.forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1200;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if(progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
document.addEventListener('DOMContentLoaded', () => animateCounters());

/* ---------------------------------------------------------------------
   Hero "live feed" console — simulated SOC log lines, typed in one
   at a time then looped. Purely decorative / illustrative.
--------------------------------------------------------------------- */
const SOC_FEED_LINES = [
  { t:'02:14:08', lvl:'info', msg:'New enrollment request received — queued for review' },
  { t:'02:14:22', lvl:'ok',   msg:'Batch SOC-2026-B04 credentials issued' },
  { t:'02:15:03', lvl:'warn', msg:'Unusual login pattern flagged for lab-sandbox-07' },
  { t:'02:15:41', lvl:'info', msg:'SIEM lab environment provisioned for 12 students' },
  { t:'02:16:12', lvl:'crit', msg:'Simulated ransomware exercise triggered on range-3' },
  { t:'02:16:30', lvl:'ok',   msg:'Incident response drill closed — avg. response 4m12s' },
  { t:'02:17:05', lvl:'info', msg:'Threat hunting module unlocked for Batch B04' },
  { t:'02:17:44', lvl:'ok',   msg:'Registration portal sync complete' },
];

function startConsoleFeed(el){
  if(!el) return;
  let i = 0;
  function renderNext(){
    // keep only the most recent 6 lines visible
    if(el.children.length >= 6){
      el.removeChild(el.firstElementChild);
    }
    const line = SOC_FEED_LINES[i % SOC_FEED_LINES.length];
    const row = document.createElement('div');
    row.className = 'console-line';
    row.innerHTML = `<span class="t">${line.t}</span><span class="lvl ${line.lvl}">[${line.lvl.toUpperCase()}]</span><span class="msg">${line.msg}</span>`;
    el.appendChild(row);
    i++;
    setTimeout(renderNext, 1900);
  }
  renderNext();
}

document.addEventListener('DOMContentLoaded', () => {
  const consoleEl = document.getElementById('socConsole');
  if(consoleEl) startConsoleFeed(consoleEl);
});

/* ---------------------------------------------------------------------
   Small helper: format an ISO date string for table / detail display
--------------------------------------------------------------------- */
function formatDate(iso){
  if(!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
}
