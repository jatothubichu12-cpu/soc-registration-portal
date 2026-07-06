/* ==========================================================================
   admin.js — demo authentication gate for the admin dashboard.
   This is a client-side demo only: credentials are intentionally visible
   on the login screen and are NOT a real security boundary.
   ========================================================================== */

const DEMO_USERNAME = 'Bittu';
const DEMO_PASSWORD = 'B@chu';

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, skip straight to the dashboard.
  if(sessionStorage.getItem(SOC_ADMIN_SESSION_KEY) === 'active'){
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const errorBox = document.getElementById('loginError');
  if(!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if(username === DEMO_USERNAME && password === DEMO_PASSWORD){
      sessionStorage.setItem(SOC_ADMIN_SESSION_KEY, 'active');
      showToast('Login successful. Redirecting...', 'success', 1400);
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
    } else {
      errorBox.classList.add('show');
      showToast('Invalid username or password.', 'error');
    }
  });
});
