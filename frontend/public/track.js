/* InternPulse visit counter (for the admin panel's traffic numbers).
   Anonymous: a random visitor id in localStorage, a session id in sessionStorage, the
   page name and the site that linked here. No cookies, no IP stored, no personal data.
   The page behaves the same for every visitor: the server decides what not to count
   (bots and automated browsers by their User-Agent, and pages served from localhost). */
(function () {
  try {
    var host = location.hostname;
    var local = host === 'localhost' || host === '127.0.0.1' || /\.localhost$/.test(host);
    var meta = document.querySelector('meta[name="api-url"]');
    var api = local ? 'http://localhost:5000' : (meta && meta.content) || '';
    if (!/^https?:\/\//.test(api)) return;

    var makeId = function () {
      return window.crypto && crypto.randomUUID ? crypto.randomUUID()
        : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
    };
    var keep = function (store, key) {
      var v = store.getItem(key);
      var fresh = !v;
      if (fresh) { v = makeId(); store.setItem(key, v); }
      return { id: v, fresh: fresh };
    };
    var visitor = keep(localStorage, 'ip_vid');
    var session = keep(sessionStorage, 'ip_sid');
    var params = new URLSearchParams(location.search);
    var source = params.get('utm_source') || params.get('ref') || '';
    var isApp = /\/app(\.html)?$/.test(location.pathname);
    var first = true;
    var last = '';

    var send = function () {
      var page = isApp ? (location.hash.replace('#', '') || 'jobs') : 'landing';
      if (page === last) return;
      last = page;
      var body = JSON.stringify({
        v: visitor.id, s: session.id, n: visitor.fresh && first, p: page,
        r: first ? document.referrer : '', u: first ? source : '',
      });
      first = false;
      fetch(api.replace(/\/+$/, '') + '/api/analytics/visit', {
        method: 'POST', body: body, keepalive: true, credentials: 'omit',
        headers: { 'Content-Type': 'text/plain' },
      }).catch(function () {});
    };

    send();
    if (isApp) window.addEventListener('hashchange', send);
  } catch { /* storage blocked or an old browser: count nothing */ }
})();
