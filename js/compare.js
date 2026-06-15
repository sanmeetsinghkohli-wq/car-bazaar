/* ============================================================
   Car Bazaar - Comparison Meter
   Builds a side-by-side matrix of the queued vehicles, awards a
   "Best Value Selection" badge, and projects depreciation.
   ============================================================ */

(function () {
  'use strict';

  var root = document.getElementById('compare-root');

  function aed(n) { return 'AED ' + Number(n).toLocaleString('en-US'); }
  function mileageNum(m) { return parseInt(String(m).replace(/[^0-9]/g, ''), 10) || 0; }

  /* Best value = highest PPI score per AED (score / price), normalised. */
  function bestValueId(cars) {
    var best = null, bestRatio = -1;
    cars.forEach(function (c) {
      var ratio = c.ppi_score / c.price;
      if (ratio > bestRatio) { bestRatio = ratio; best = c.id; }
    });
    return best;
  }

  /* Annual depreciation rate driven by mileage + inspection score:
     newer/cleaner cars hold value better. */
  function depRate(car) {
    var base = 0.12;
    if (mileageNum(car.mileage) > 40000) base += 0.04;
    if (car.ppi_score >= 92) base -= 0.03;
    else if (car.ppi_score < 82) base += 0.03;
    return base;
  }

  function projectValues(car) {
    var rate = depRate(car), v = car.price, out = [];
    for (var y = 1; y <= 3; y++) { v = Math.round(v * (1 - rate)); out.push(v); }
    return out;
  }

  function render(cars) {
    var bestId = bestValueId(cars);

    // ---- Specification matrix ----
    var rows = [
      ['Price', function (c) { return '<strong>' + aed(c.price) + '</strong>'; }],
      ['Year', function (c) { return c.year; }],
      ['Mileage', function (c) { return c.mileage; }],
      ['Source', function (c) { return c.source; }],
      ['PPI Score', function (c) { return '<span class="badge badge--' + (c.ppi_score >= 90 ? 'good' : 'warn') + '">' + c.ppi_score + '/100 · ' + c.ppi_status + '</span>'; }]
    ];

    var html = '<div class="toolbar"><h2 style="margin:0">Comparison Matrix</h2>' +
      '<button class="btn btn--ghost btn--sm" id="clear-compare">Clear selection</button></div>';

    html += '<div class="table-wrap"><table class="data"><thead><tr><th>Specification</th>';
    cars.forEach(function (c) {
      html += '<th>' + c.make + ' ' + c.model +
        (c.id === bestId ? ' <span class="badge badge--best">★ Best Value Selection</span>' : '') + '</th>';
    });
    html += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr><td>' + r[0] + '</td>';
      cars.forEach(function (c) { html += '<td>' + r[1](c) + '</td>'; });
      html += '</tr>';
    });
    html += '</tbody></table></div>';

    // ---- PPI diagnostic comparison ----
    html += '<h2 class="section--tight" style="padding-bottom:0">PPI Diagnostic Comparison</h2>';
    html += '<div class="table-wrap" style="margin-top:16px"><table class="data"><thead><tr><th>Health Metric</th>';
    cars.forEach(function (c) { html += '<th>' + c.make + ' ' + c.model + '</th>'; });
    html += '</tr></thead><tbody>';
    [['Engine &amp; Drivetrain', 'engine'], ['Chassis &amp; Frame', 'chassis'], ['Electronics &amp; OBD', 'electronics']].forEach(function (m) {
      html += '<tr><td>' + m[0] + '</td>';
      cars.forEach(function (c) { html += '<td>' + c.ppi_breakdown[m[1]] + '</td>'; });
      html += '</tr>';
    });
    html += '</tbody></table></div>';

    // ---- Depreciation tracker ----
    html += '<h2 class="section--tight" style="padding-bottom:0">3-Year Depreciation Forecast</h2>' +
      '<p class="muted">Projected resale value based on current mileage and inspection score.</p>';
    html += '<div class="depreciation-grid">';
    cars.forEach(function (c) {
      var proj = projectValues(c);
      html += '<div class="card" style="padding:18px">' +
        '<div style="font-weight:700;margin-bottom:8px">' + c.make + ' ' + c.model + '</div>' +
        '<div class="row" style="display:flex;justify-content:space-between"><span class="muted">Today</span><strong>' + aed(c.price) + '</strong></div>';
      proj.forEach(function (v, i) {
        var loss = Math.round((1 - v / c.price) * 100);
        html += '<div class="row" style="display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:6px;margin-top:6px">' +
          '<span class="muted">Year ' + (i + 1) + '</span><span>' + aed(v) + ' <small style="color:var(--bad)">(-' + loss + '%)</small></span></div>';
      });
      html += '</div>';
    });
    html += '</div>';

    root.innerHTML = html;
    document.getElementById('clear-compare').addEventListener('click', function () {
      CompareStore.clear();
      location.reload();
    });
  }

  /* ---------- Boot ---------- */
  var ids = CompareStore.get();
  if (ids.length < 2) {
    root.innerHTML =
      '<div class="compare-empty card" style="padding:64px 24px">' +
      '<h2>Select vehicles to compare</h2>' +
      '<p class="muted">Pick at least 2 (up to 3) cars from the marketplace using the <strong>“+ Add to Compare”</strong> checkbox.</p>' +
      '<a class="btn btn--primary" href="inventory.html">Go to Marketplace</a></div>';
    return;
  }

  loadData()
    .then(function (db) {
      var selected = (db.cars || []).filter(function (c) { return ids.indexOf(c.id) !== -1; });
      if (selected.length < 2) {
        root.innerHTML = '<p class="loading">Selected vehicles are no longer available. <a href="inventory.html">Back to marketplace</a></p>';
        return;
      }
      render(selected);
    })
    .catch(function () {
      root.innerHTML = '<p class="loading">Could not load data. Make sure the Node server is running.</p>';
    });
})();
