/* ============================================================
   Car Bazaar - Live Marketplace Feed
   Renders car cards from the JSON API, PPI checklist modals,
   the compare queue, and the live-bidding auction ticker.
   ============================================================ */

(function () {
  'use strict';

  var grid = document.getElementById('car-grid');
  var auctionStrip = document.getElementById('auction-strip');
  var compareBar = document.getElementById('compare-bar');
  var compareCount = document.getElementById('compare-count');
  var modalBackdrop = document.getElementById('ppi-modal');
  var modalTitle = document.getElementById('ppi-modal-title');
  var modalBody = document.getElementById('ppi-modal-body');

  var CARS = [];

  function aed(n) { return 'AED ' + Number(n).toLocaleString('en-US'); }

  function scoreBadge(score) {
    var cls = score >= 90 ? 'good' : score >= 80 ? 'warn' : 'bad';
    var dot = score >= 90 ? '🟢' : score >= 80 ? '🟡' : '🔴';
    return '<span class="badge badge--' + cls + ' ppi-chip">' + dot + ' ' + score + '/100</span>';
  }

  /* ---------- Render the grid ---------- */
  function renderCards() {
    grid.innerHTML = '';
    CARS.forEach(function (car) {
      var card = document.createElement('article');
      card.className = 'car-card';
      card.innerHTML =
        '<div class="thumb" data-id="' + car.id + '">' +
          '<img src="' + car.image + '" alt="' + car.make + ' ' + car.model + '" ' +
               'onerror="this.src=\'images/placeholder.svg\'">' +
          '<span class="source-chip">Sourced from ' + car.source + '</span>' +
          '<span data-id="' + car.id + '">' + scoreBadge(car.ppi_score) + '</span>' +
        '</div>' +
        '<div class="body">' +
          '<div class="title">' + car.make + ' ' + car.model + '</div>' +
          '<div class="price">' + aed(car.price) + '</div>' +
          '<div class="spec"><span>📅 ' + car.year + '</span><span>🛣️ ' + car.mileage + '</span>' +
            '<span class="badge badge--' + (car.ppi_score >= 90 ? 'good' : 'warn') + '">' + car.ppi_status + '</span></div>' +
          '<div class="foot">' +
            '<label class="compare-toggle">' +
              '<input type="checkbox" class="cmp" data-id="' + car.id + '"' +
                (CompareStore.has(car.id) ? ' checked' : '') + '> + Add to Compare' +
            '</label>' +
            '<button class="btn btn--ghost btn--sm view-ppi" data-id="' + car.id + '">View PPI</button>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });
    wireCardEvents();
    updateCompareBar();
  }

  function wireCardEvents() {
    // Open modal from thumbnail / badge / button
    grid.querySelectorAll('.thumb, .view-ppi, .ppi-chip').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        openModal(el.getAttribute('data-id') || el.closest('[data-id]').getAttribute('data-id'));
      });
    });
    // Compare checkboxes
    grid.querySelectorAll('.cmp').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var res = CompareStore.toggle(cb.getAttribute('data-id'));
        if (!res.ok && res.reason === 'limit') {
          cb.checked = false;
          alert('You can compare up to 3 vehicles at a time.');
          return;
        }
        updateCompareBar();
      });
    });
  }

  /* ---------- Compare bar ---------- */
  function updateCompareBar() {
    var ids = CompareStore.get();
    compareCount.textContent = ids.length;
    compareBar.classList.toggle('hide', ids.length === 0);
  }

  /* ---------- PPI checklist modal ---------- */
  function checklistRow(text) {
    return '<li><span class="check-ok">✔</span> ' + text + '</li>';
  }

  function openModal(id) {
    var car = CARS.filter(function (c) { return c.id === id; })[0];
    if (!car) return;
    var b = car.ppi_breakdown;
    modalTitle.textContent = car.make + ' ' + car.model + ' — PPI Report (' + car.ppi_score + '/100)';
    modalBody.innerHTML =
      '<div class="checklist-group"><h4>Engine &amp; Drivetrain</h4><ul>' +
        checklistRow(b.engine) +
        checklistRow('Transmission shift quality verified') +
        checklistRow('Cooling system pressure-tested') +
      '</ul></div>' +
      '<div class="checklist-group"><h4>Chassis &amp; Frame</h4><ul>' +
        checklistRow(b.chassis) +
        checklistRow('Suspension &amp; alignment inspected') +
        checklistRow('Tyre tread depth within spec') +
      '</ul></div>' +
      '<div class="checklist-group"><h4>Electronics &amp; OBD</h4><ul>' +
        checklistRow(b.electronics) +
        checklistRow('OBD-II diagnostic scan completed') +
        checklistRow('Safety systems &amp; airbags confirmed') +
      '</ul></div>';
    modalBackdrop.classList.add('open');
  }

  function closeModal() { modalBackdrop.classList.remove('open'); }
  modalBackdrop.addEventListener('click', function (e) { if (e.target === modalBackdrop) closeModal(); });
  document.getElementById('ppi-modal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  /* ---------- Live auction ticker ---------- */
  function renderAuctions() {
    var live = CARS.filter(function (c) { return c.is_auction; });
    if (!live.length) { auctionStrip.classList.add('hide'); return; }

    auctionStrip.innerHTML = '<div style="grid-column:1/-1;font-weight:700">🔴 Live Auctions</div>';
    live.forEach(function (car) {
      // Each auction ends at a random point in the next 1–3 hours.
      car._endsAt = Date.now() + (3600 * 1000) + Math.random() * 2 * 3600 * 1000;
      var tile = document.createElement('div');
      tile.className = 'auction-tile';
      tile.innerHTML =
        '<h4>' + car.make + ' ' + car.model + '</h4>' +
        '<div class="meta">' + car.year + ' · ' + car.mileage + '</div>' +
        '<div class="bid" id="bid-' + car.id + '">AED ' + Number(car.current_bid).toLocaleString() + '</div>' +
        '<div class="meta">Current highest bid</div>' +
        '<div class="countdown" id="cd-' + car.id + '">--:--:--</div>';
      auctionStrip.appendChild(tile);
    });

    setInterval(function () { tickAuctions(live); }, 2000);
    tickAuctions(live);
  }

  function tickAuctions(live) {
    live.forEach(function (car) {
      // Randomly bump the highest bid to simulate live activity.
      if (Math.random() < 0.5) {
        car.current_bid += Math.floor(Math.random() * 9 + 1) * 500;
        var bidEl = document.getElementById('bid-' + car.id);
        if (bidEl) bidEl.textContent = 'AED ' + Number(car.current_bid).toLocaleString();
      }
      // Countdown
      var remain = Math.max(0, car._endsAt - Date.now());
      var h = Math.floor(remain / 3600000);
      var m = Math.floor((remain % 3600000) / 60000);
      var s = Math.floor((remain % 60000) / 1000);
      var cd = document.getElementById('cd-' + car.id);
      if (cd) cd.textContent = '⏱ ' + pad(h) + ':' + pad(m) + ':' + pad(s);
    });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- Boot ---------- */
  loadData()
    .then(function (db) {
      CARS = db.cars || [];
      renderCards();
      renderAuctions();
    })
    .catch(function () {
      grid.innerHTML = '<p class="loading">Could not load the marketplace. Make sure the Node server is running (node server.js).</p>';
    });
})();
