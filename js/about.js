/* ============================================================
   Car Bazaar - About / Trust Anchor
   Renders awards + testimonials from the API and runs the
   automated negotiation chatbox.
   ============================================================ */

(function () {
  'use strict';

  var awardList = document.getElementById('award-list');
  var testiGrid = document.getElementById('testi-grid');

  function stars(n) {
    var s = '';
    for (var i = 0; i < 5; i++) s += i < n ? '★' : '☆';
    return s;
  }

  /* ---------- Awards + testimonials ---------- */
  loadData()
    .then(function (db) {
      (db.awards || []).forEach(function (a) {
        var li = document.createElement('li');
        li.innerHTML = '<span class="yr">' + a.year + '</span>' +
          '<span><strong>' + a.title + '</strong><br><span class="muted">' + a.body + '</span></span>';
        awardList.appendChild(li);
      });

      (db.testimonials || []).forEach(function (t) {
        var card = document.createElement('div');
        card.className = 'testi-card';
        card.innerHTML =
          '<div class="stars">' + stars(t.rating || 5) + '</div>' +
          '<p>“' + t.comment + '”</p>' +
          '<div class="who">' + t.name + '</div>' +
          '<div class="role">' + t.role + '</div>';
        testiGrid.appendChild(card);
      });
    })
    .catch(function () {
      if (awardList) awardList.innerHTML = '<li>Could not load awards (start the Node server).</li>';
    });

  /* ---------- Live negotiation chatbox ---------- */
  var fab = document.getElementById('chat-fab');
  var win = document.getElementById('chat-window');
  var body = document.getElementById('chat-body');
  var input = document.getElementById('chat-input');
  var sendBtn = document.getElementById('chat-send');

  fab.addEventListener('click', function () {
    win.classList.toggle('open');
    if (win.classList.contains('open') && !body.dataset.greeted) {
      botSay('Welcome to Car Bazaar! 👋 Ask me about pricing, our PPI guarantee, trade-ins, or viewings.');
      body.dataset.greeted = '1';
    }
  });

  function addMsg(text, who) {
    var el = document.createElement('div');
    el.className = 'chat-msg ' + who;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }
  function botSay(text) { setTimeout(function () { addMsg(text, 'bot'); }, 450); }

  /* Preset dealership-style automated replies. */
  function autoReply(q) {
    q = q.toLowerCase();
    if (/discount|cheaper|lower|deal|negotiat|price/.test(q))
      return 'Our vehicles are competitively priced against their verified PPI scores. On high-rated cars (90+/100) we hold firm, but I can flag your interest to a sales advisor for a possible loyalty offer.';
    if (/ppi|inspection|report|condition/.test(q))
      return 'Every listing includes a 200-point PPI report covering Engine & Drivetrain, Chassis & Frame, and Electronics & OBD. The score reflects independently verified condition — a 94/100 means excellent, near-showroom shape.';
    if (/trade|exchange|swap/.test(q))
      return 'Absolutely — head to our Buy, Sell & Trade Center. The escrow wallet simulator instantly shows your Bazaar Clearance Balance so you know exactly what to pay or receive.';
    if (/finance|loan|installment|emi|monthly/.test(q))
      return 'We partner with leading UAE banks for financing from 1.99% APR. Share your budget and I can outline an indicative monthly plan.';
    if (/view|test drive|visit|appointment|slot/.test(q))
      return 'You can book a viewing slot from the Transaction page. Our PPI team can also meet you on-site for a live inspection.';
    if (/warranty|guarantee|return/.test(q))
      return 'All verified cars come with a 7-day money-back assurance and an optional extended warranty on vehicles scoring 85+/100.';
    if (/hello|hi|hey|salam/.test(q))
      return 'Hi there! How can I help with your next car today?';
    return 'Thanks for your question! A Car Bazaar advisor will follow up shortly. In the meantime, our PPI-verified listings carry a full diagnostic report for total transparency.';
  }

  function handleSend() {
    var text = input.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    input.value = '';
    botSay(autoReply(text));
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') handleSend(); });
})();
