/* ============================================================
   Car Bazaar - Form validation
   Intercepts submissions on the transaction page, enforces the
   field rules, and POSTs valid bookings to the Node API.
   ============================================================ */

var Validator = (function () {
  'use strict';

  function setError(input, message) {
    var field = input.closest('.field');
    if (!field) return;
    var err = field.querySelector('.err');
    if (err) err.textContent = message || '';
    input.classList.toggle('invalid', !!message);
  }

  // ---- Individual rules ----
  function checkName(v) {
    if (!v || v.trim().length < 3) return 'Name must be at least 3 characters.';
    return '';
  }
  function checkEmail(v) {
    // Must contain an @ and a dotted domain extension.
    if (!v) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email (must include @ and a domain).';
    return '';
  }
  function checkPhone(v) {
    if (!v) return 'Phone number is required.';
    // Standard numeric format: optional +, digits, spaces or dashes, 7–15 digits.
    if (!/^\+?[0-9][0-9\s\-]{6,14}$/.test(v)) return 'Enter a valid numeric phone number.';
    return '';
  }
  function checkYear(v) {
    var y = parseInt(v, 10);
    if (!v) return 'Production year is required.';
    if (isNaN(y) || y < 2000 || y > 2026) return 'Year must be between 2000 and 2026.';
    return '';
  }

  /* Validate a form. Each field opts in via data-rule="name|email|phone|year". */
  function validateForm(form) {
    var ok = true;
    var rules = { name: checkName, email: checkEmail, phone: checkPhone, year: checkYear };
    form.querySelectorAll('[data-rule]').forEach(function (input) {
      var fn = rules[input.getAttribute('data-rule')];
      if (!fn) return;
      var msg = fn(input.value);
      setError(input, msg);
      if (msg) ok = false;
    });
    return ok;
  }

  /* Wire a form: block invalid submits, POST valid ones to the API. */
  function attach(form, requestType, statusEl) {
    // Live feedback as the user leaves a field.
    form.querySelectorAll('[data-rule]').forEach(function (input) {
      input.addEventListener('blur', function () {
        var rules = { name: checkName, email: checkEmail, phone: checkPhone, year: checkYear };
        var fn = rules[input.getAttribute('data-rule')];
        if (fn) setError(input, fn(input.value));
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusEl.className = 'form-status';
      statusEl.textContent = '';

      if (!validateForm(form)) {
        statusEl.classList.add('fail');
        statusEl.textContent = 'Please fix the highlighted fields before submitting.';
        return;
      }

      var data = { request_type: requestType };
      new FormData(form).forEach(function (val, key) { data[key] = val; });

      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
        .then(function (res) {
          statusEl.classList.add('ok');
          statusEl.textContent = '✔ Request submitted successfully. Reference: ' + res.record.id;
          form.reset();
        })
        .catch(function () {
          statusEl.classList.add('fail');
          statusEl.textContent = 'Could not reach the server. Make sure node server.js is running.';
        });
    });
  }

  return { attach: attach, validateForm: validateForm };
})();
