/* ============================================================
   Car Bazaar - shared site behaviour
   Mobile nav, active-link highlighting, and the cross-page
   "Compare" queue (persisted in localStorage).
   ============================================================ */

(function () {
  'use strict';

  // ---- Mobile navigation toggle ----
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-matrix');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  // ---- Highlight the current page in the nav ----
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-matrix a').forEach(function (link) {
    var target = link.getAttribute('href');
    if (target === here || (here === '' && target === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ---- Compare queue: shared helper used by inventory + compare pages ---- */
var CompareStore = (function () {
  'use strict';
  var KEY = 'cb_compare';

  function get() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function save(ids) {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }
  function has(id) {
    return get().indexOf(id) !== -1;
  }
  function toggle(id) {
    var ids = get();
    var i = ids.indexOf(id);
    if (i === -1) {
      if (ids.length >= 3) return { ok: false, reason: 'limit' }; // max 3 vehicles
      ids.push(id);
    } else {
      ids.splice(i, 1);
    }
    save(ids);
    return { ok: true, ids: ids };
  }
  function remove(id) {
    save(get().filter(function (x) { return x !== id; }));
  }
  function clear() { save([]); }

  return { get: get, has: has, toggle: toggle, remove: remove, clear: clear };
})();

/* ---- Shared fetch helper for the JSON API ---- */
function loadData() {
  return fetch('/api/data').then(function (r) {
    if (!r.ok) throw new Error('API error');
    return r.json();
  });
}
