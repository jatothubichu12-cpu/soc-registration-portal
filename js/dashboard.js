/* ==========================================================================
   dashboard.js — admin dashboard: reads registrations from LocalStorage,
   renders stats + table, supports search/filter/view/edit/delete/export.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Auth guard: bounce back to login if no active admin session ----
  if(sessionStorage.getItem(SOC_ADMIN_SESSION_KEY) !== 'active'){
    window.location.href = 'admin.html';
    return;
  }

  const tableBody   = document.getElementById('tableBody');
  const emptyState  = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const filterBatch = document.getElementById('filterBatch');
  const filterDept  = document.getElementById('filterDept');
  const filterDomain= document.getElementById('filterDomain');

  let records = SOCData.getAll();

  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem(SOC_ADMIN_SESSION_KEY);
    window.location.href = 'index.html';
  });

  /* ---------------- Stats ---------------- */
  function renderStats(){
    const today = new Date().toDateString();
    const todaysCount = records.filter(r => r.createdAt && new Date(r.createdAt).toDateString() === today).length;
    const batches = new Set(records.map(r => r.batchNumber).filter(Boolean));
    const depts   = new Set(records.map(r => r.department).filter(Boolean));

    document.getElementById('statTotal').setAttribute('data-count', records.length);
    document.getElementById('statToday').setAttribute('data-count', todaysCount);
    document.getElementById('statBatches').setAttribute('data-count', batches.size);
    document.getElementById('statDepts').setAttribute('data-count', depts.size);
    animateCounters(document);
  }

  /* ---------------- Filter dropdown population ---------------- */
  function populateFilters(){
    const batches = [...new Set(records.map(r => r.batchNumber).filter(Boolean))].sort();
    const depts   = [...new Set(records.map(r => r.department).filter(Boolean))].sort();
    const domains = [...new Set(records.map(r => r.domain).filter(Boolean))].sort();

    fillSelect(filterBatch, batches, 'All Batches');
    fillSelect(filterDept, depts, 'All Departments');
    fillSelect(filterDomain, domains, 'All Domains');
  }
  function fillSelect(select, values, allLabel){
    const current = select.value;
    select.innerHTML = `<option value="">${allLabel}</option>` +
      values.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
    if(values.includes(current)) select.value = current;
  }

  /* ---------------- Table rendering ---------------- */
  function currentFiltered(){
    const q = searchInput.value.trim().toLowerCase();
    const batch = filterBatch.value;
    const dept  = filterDept.value;
    const domain = filterDomain.value;

    return records.filter(r => {
      if(batch && r.batchNumber !== batch) return false;
      if(dept && r.department !== dept) return false;
      if(domain && r.domain !== domain) return false;
      if(q){
        const hay = `${r.fullName || ''} ${r.studentId || ''} ${r.email || ''} ${r.rollNumber || ''}`.toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderTable(){
    const filtered = currentFiltered();
    tableBody.innerHTML = '';

    if(filtered.length === 0){
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
    }

    filtered
      .slice()
      .sort((a,b) => b.id - a.id)
      .forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="cell-id">${SOCData.studentIdTag(r.id)}</td>
          <td class="cell-name">${escapeHtml(r.fullName || '—')}</td>
          <td>${escapeHtml(r.batchNumber || '—')}</td>
          <td>${escapeHtml(r.department || '—')}</td>
          <td>${escapeHtml(r.email || '—')}</td>
          <td>${escapeHtml(r.phone || '—')}</td>
          <td><span class="badge">${escapeHtml(r.domain || '—')}</span></td>
          <td>
            <div class="row-actions">
              <button class="icon-btn" title="View Details" data-action="view" data-id="${r.id}"><i class="fa-solid fa-eye"></i></button>
              <button class="icon-btn" title="Edit" data-action="edit" data-id="${r.id}"><i class="fa-solid fa-pen"></i></button>
              <button class="icon-btn danger" title="Delete" data-action="delete" data-id="${r.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>`;
        tableBody.appendChild(tr);
      });
  }

  function escapeHtml(str){
    return String(str ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function refreshAll(){
    records = SOCData.getAll();
    renderStats();
    populateFilters();
    renderTable();
  }

  [searchInput].forEach(el => el.addEventListener('input', renderTable));
  [filterBatch, filterDept, filterDomain].forEach(el => el.addEventListener('change', renderTable));

  /* ---------------- View modal ---------------- */
  const viewModal = document.getElementById('viewModal');
  const detailGrid = document.getElementById('detailGrid');

  function openView(id){
    const r = records.find(x => x.id === id);
    if(!r) return;
    const fields = [
      ['Student ID', SOCData.studentIdTag(r.id)],
      ['Full Name', r.fullName],
      ['Roll Number', r.rollNumber],
      ['Batch Number', r.batchNumber],
      ['College', r.collegeName],
      ['Department', r.department],
      ['Year', r.year],
      ['Email', r.email],
      ['Phone', r.phone],
      ['Date of Birth', r.dob],
      ['Gender', r.gender],
      ['City', r.city],
      ['State', r.state],
      ['Domain', r.domain],
      ['Experience', r.experience],
      ['Programming Skills', r.programmingSkills || '—'],
      ['Operating Systems', r.operatingSystems || '—'],
      ['GitHub', r.github || '—'],
      ['LinkedIn', r.linkedin || '—'],
      ['Registered On', formatDate(r.createdAt)],
    ];
    detailGrid.innerHTML = fields.map(([label, val]) =>
      `<div class="detail-item"><span>${label}</span><strong>${escapeHtml(val || '—')}</strong></div>`
    ).join('') +
      `<div class="detail-item full"><span>Why join SOC</span><strong>${escapeHtml(r.motivation || '—')}</strong></div>` +
      `<div class="detail-item full"><span>Additional Comments</span><strong>${escapeHtml(r.comments || '—')}</strong></div>`;
    viewModal.classList.add('open');
  }

  /* ---------------- Edit modal ---------------- */
  const editModal = document.getElementById('editModal');
  const editForm = document.getElementById('editForm');

  function openEdit(id){
    const r = records.find(x => x.id === id);
    if(!r) return;
    document.getElementById('editId').value = r.id;
    document.getElementById('editFullName').value = r.fullName || '';
    document.getElementById('editBatch').value = r.batchNumber || '';
    document.getElementById('editDept').value = r.department || '';
    document.getElementById('editEmail').value = r.email || '';
    document.getElementById('editPhone').value = r.phone || '';
    document.getElementById('editDomain').value = r.domain || 'SOC Analyst';
    editModal.classList.add('open');
  }

  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('editId').value, 10);
    SOCData.update(id, {
      fullName: document.getElementById('editFullName').value.trim(),
      batchNumber: document.getElementById('editBatch').value.trim(),
      department: document.getElementById('editDept').value.trim(),
      email: document.getElementById('editEmail').value.trim(),
      phone: document.getElementById('editPhone').value.trim(),
      domain: document.getElementById('editDomain').value,
    });
    editModal.classList.remove('open');
    showToast('Registration updated successfully.', 'success');
    refreshAll();
  });

  /* ---------------- Delete modal ---------------- */
  const deleteModal = document.getElementById('deleteModal');
  let pendingDeleteId = null;

  function openDelete(id){
    pendingDeleteId = id;
    deleteModal.classList.add('open');
  }
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    if(pendingDeleteId != null){
      SOCData.remove(pendingDeleteId);
      showToast('Registration deleted.', 'success');
      pendingDeleteId = null;
      deleteModal.classList.remove('open');
      refreshAll();
    }
  });

  /* ---------------- Modal close wiring ---------------- */
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if(e.target === overlay) overlay.classList.remove('open');
    });
  });

  /* ---------------- Row action delegation ---------------- */
  tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const id = parseInt(btn.getAttribute('data-id'), 10);
    const action = btn.getAttribute('data-action');
    if(action === 'view') openView(id);
    if(action === 'edit') openEdit(id);
    if(action === 'delete') openDelete(id);
  });

  /* ---------------- CSV export ---------------- */
  document.getElementById('exportBtn').addEventListener('click', () => {
    if(records.length === 0){
      showToast('No registrations to export yet.', 'error');
      return;
    }
    const headers = ['Student ID','Full Name','Roll Number','Batch','College','Department','Year','Email','Phone','DOB','Gender','City','State','Domain','Experience','Programming Skills','Operating Systems','GitHub','LinkedIn','Motivation','Comments','Registered On'];
    const rows = records.map(r => [
      SOCData.studentIdTag(r.id), r.fullName, r.rollNumber, r.batchNumber, r.collegeName, r.department, r.year,
      r.email, r.phone, r.dob, r.gender, r.city, r.state, r.domain, r.experience, r.programmingSkills,
      r.operatingSystems, r.github, r.linkedin, r.motivation, r.comments, formatDate(r.createdAt)
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g,'""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soc-registrations-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV export started.', 'success');
  });

  refreshAll();
});
