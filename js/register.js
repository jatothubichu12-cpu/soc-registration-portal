/* ==========================================================================
   register.js — validates and submits the SOC registration form,
   persisting the record into LocalStorage via SOCData.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('regForm');
  if(!form) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^[0-9]{10}$/;

  const validators = {
    fullName: v => v.trim().length >= 3,
    studentId: v => v.trim().length >= 3,
    rollNumber: v => v.trim().length >= 2,
    batchNumber: v => v.trim().length >= 2,
    collegeName: v => v.trim().length >= 3,
    department: v => v.trim().length >= 2,
    year: v => v.trim().length > 0,
    email: v => EMAIL_RE.test(v.trim()),
    phone: v => PHONE_RE.test(v.trim()),
    dob: v => v.trim().length > 0,
    gender: v => v.trim().length > 0,
    city: v => v.trim().length >= 2,
    state: v => v.trim().length >= 2,
    domain: v => v.trim().length > 0,
    experience: v => v.trim().length > 0,
    motivation: v => v.trim().length >= 10,
  };

  function fieldWrap(name){
    return form.querySelector(`[data-field="${name}"]`);
  }

  function validateField(name){
    const input = form.elements[name];
    const wrap = fieldWrap(name);
    if(!input || !wrap || !validators[name]) return true;
    const ok = validators[name](input.value || '');
    wrap.classList.toggle('invalid', !ok);
    wrap.classList.toggle('valid', ok);
    return ok;
  }

  // live validation as the student types / selects
  Object.keys(validators).forEach(name => {
    const input = form.elements[name];
    if(!input) return;
    input.addEventListener('blur', () => validateField(name));
    input.addEventListener('input', () => {
      if(fieldWrap(name).classList.contains('invalid')) validateField(name);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let allValid = true;
    Object.keys(validators).forEach(name => {
      if(!validateField(name)) allValid = false;
    });

    const consent = form.elements['consent'];
    const consentRow = consent.closest('.consent-row');
    if(!consent.checked){
      consentRow.style.borderColor = 'var(--signal-red)';
      allValid = false;
    } else {
      consentRow.style.borderColor = 'var(--line)';
    }

    if(!allValid){
      showToast('Please fix the highlighted fields before submitting.', 'error');
      const firstInvalid = form.querySelector('.field.invalid');
      if(firstInvalid) firstInvalid.scrollIntoView({ behavior:'smooth', block:'center' });
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

    const fd = new FormData(form);
    const record = {};
    fd.forEach((value, key) => { record[key] = typeof value === 'string' ? value.trim() : value; });
    record.consent = true;

    // simulate a brief processing delay for a realistic submission feel
    setTimeout(() => {
      const saved = SOCData.add(record);
      showToast('Registration submitted successfully!', 'success');

      document.getElementById('formWrap').style.display = 'none';
      const successPanel = document.getElementById('successPanel');
      document.getElementById('refId').textContent = SOCData.studentIdTag(saved.id);
      successPanel.classList.add('show');
    }, 700);
  });
});
