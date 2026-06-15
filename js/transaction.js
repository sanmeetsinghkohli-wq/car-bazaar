/* ============================================================
   Car Bazaar - Buy, Sell & Trade Center
   Tab switching, wallet (escrow) simulator, and wiring each
   form to the external Validator.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Tabs ---------- */
  var tabs = document.querySelectorAll('.tab-btn');
  var panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabs.forEach(function (b) { b.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
    });
  });

  /* ---------- Attach validation to all three forms ---------- */
  Validator.attach(document.getElementById('sell-form'), 'sell', document.getElementById('sell-status'));
  Validator.attach(document.getElementById('trade-form'), 'trade-in', document.getElementById('trade-status'));
  Validator.attach(document.getElementById('viewing-form'), 'viewing', document.getElementById('viewing-status'));

  /* ---------- Escrow-style trade wallet simulator ---------- */
  var marketSelect = document.getElementById('trade-market-car');
  var myValueInput = document.getElementById('trade-my-value');
  var wallet = document.getElementById('wallet');
  var walletMarket = document.getElementById('wallet-market');
  var walletMine = document.getElementById('wallet-mine');
  var walletBalance = document.getElementById('wallet-balance');
  var walletNote = document.getElementById('wallet-note');

  var CARS = [];

  function aed(n) { return 'AED ' + Number(n).toLocaleString('en-US'); }

  function recalcWallet() {
    var car = CARS.filter(function (c) { return c.id === marketSelect.value; })[0];
    var mine = parseFloat(myValueInput.value) || 0;
    if (!car || mine <= 0) { wallet.classList.add('hide'); return; }

    wallet.classList.remove('hide');
    var diff = car.price - mine; // positive => buyer pays, negative => buyer receives
    walletMarket.textContent = aed(car.price);
    walletMine.textContent = aed(mine);

    if (diff > 0) {
      walletBalance.textContent = 'You pay ' + aed(diff);
      walletBalance.className = 'balance pay';
      walletNote.textContent = 'Bazaar Clearance Balance: settle this amount to complete the trade-in.';
    } else if (diff < 0) {
      walletBalance.textContent = 'You receive ' + aed(Math.abs(diff));
      walletBalance.className = 'balance receive';
      walletNote.textContent = 'Bazaar Clearance Balance: this credit is paid out via secure escrow on handover.';
    } else {
      walletBalance.textContent = 'Even trade — AED 0';
      walletBalance.className = 'balance';
      walletNote.textContent = 'No additional balance required. Straight swap.';
    }
  }

  marketSelect.addEventListener('change', recalcWallet);
  myValueInput.addEventListener('input', recalcWallet);

  /* ---------- Populate the market-car dropdown from the API ---------- */
  loadData()
    .then(function (db) {
      CARS = db.cars || [];
      CARS.forEach(function (c) {
        var opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.make + ' ' + c.model + ' (' + aed(c.price) + ')';
        marketSelect.appendChild(opt);
      });
    })
    .catch(function () {
      var opt = document.createElement('option');
      opt.textContent = 'Could not load cars (start the server)';
      marketSelect.appendChild(opt);
    });
})();
