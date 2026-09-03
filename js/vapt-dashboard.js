/* ==========================================================================
   VAPT SOC DASHBOARD JS
   State management for VAPT Findings, Security Headers, OWASP Checklist,
   Remediation & Retesting workflow, Audit Logs, and Report Exporter.
   ========================================================================== */

(function () {
  'use strict';

  var INITIAL_FINDINGS = [
    {
      id: 'VAPT-001',
      title: 'SQL Injection in Search Endpoint',
      severity: 'CRITICAL',
      cvss: '9.8',
      asset: '/api/v1/search',
      status: 'Open',
      assignee: 'Security Lead',
      date: '03 Sep 2026',
      description: 'Search parameter `q` is directly concatenated into SQL query string without parametrization.',
      impact: 'Full database compromise and data exfiltration.',
      remediation: 'Use PDO/Prepared Statements or ORM query binder.'
    },
    {
      id: 'VAPT-002',
      title: 'Broken Access Control on User Invoices',
      severity: 'HIGH',
      cvss: '8.5',
      asset: '/api/invoices/:id',
      status: 'In Progress',
      assignee: 'Backend Team',
      date: '02 Sep 2026',
      description: 'Changing integer ID allows viewing other users\x27 financial invoices.',
      impact: 'Unauthorized access to customer billing information.',
      remediation: 'Enforce server-side ownership authorization check before returning invoice object.'
    },
    {
      id: 'VAPT-003',
      title: 'Missing Content-Security-Policy Header',
      severity: 'MEDIUM',
      cvss: '5.4',
      asset: 'https://vapt.example.com',
      status: 'Open',
      assignee: 'DevOps',
      date: '01 Sep 2026',
      description: 'No CSP header declared on HTTP responses.',
      impact: 'Increases susceptibility to client-side XSS and data injection.',
      remediation: 'Declare Content-Security-Policy header restricting script-src and default-src.'
    },
    {
      id: 'VAPT-004',
      title: 'Weak JWT Signature Verification',
      severity: 'HIGH',
      cvss: '8.2',
      asset: '/api/auth/token',
      status: 'Fixed',
      assignee: 'Security Eng',
      date: '31 Aug 2026',
      description: 'API endpoint accepts tokens signed with "none" algorithm.',
      impact: 'Authentication bypass and privilege escalation.',
      remediation: 'Explicitly white-list RS256 algorithm and reject unsigned tokens.'
    },
    {
      id: 'VAPT-005',
      title: 'Stale TLS 1.0 / 1.1 Support',
      severity: 'LOW',
      cvss: '3.7',
      asset: '203.0.113.50:443',
      status: 'Fixed',
      assignee: 'SysAdmin',
      date: '30 Aug 2026',
      description: 'Server supports deprecated TLS protocols.',
      impact: 'Potential network eavesdropping under legacy conditions.',
      remediation: 'Disable TLS 1.0 and 1.1; enforce TLS 1.2 and TLS 1.3.'
    },
    {
      id: 'VAPT-006',
      title: 'Verbose Server Version Banner',
      severity: 'INFO',
      cvss: '0.0',
      asset: 'nginx/1.18.0',
      status: 'Verified',
      assignee: 'DevOps',
      date: '29 Aug 2026',
      description: 'Server response header discloses exact Nginx patch version.',
      impact: 'Information disclosure aiding attacker reconnaissance.',
      remediation: 'Set server_tokens off; in Nginx configuration.'
    }
  ];

  var SECURITY_HEADERS = [
    { name: 'Content-Security-Policy', status: 'WARN', val: 'Not set', expected: 'default-src \x27self\x27;' },
    { name: 'Strict-Transport-Security', status: 'PASS', val: 'max-age=31536000; includeSubDomains', expected: 'max-age=31536000' },
    { name: 'X-Content-Type-Options', status: 'PASS', val: 'nosniff', expected: 'nosniff' },
    { name: 'Referrer-Policy', status: 'PASS', val: 'strict-origin-when-cross-origin', expected: 'strict-origin-when-cross-origin' },
    { name: 'Permissions-Policy', status: 'REVIEW', val: 'geolocation=()', expected: 'camera=(), microphone=()' },
    { name: 'X-Frame-Options', status: 'PASS', val: 'DENY', expected: 'DENY or SAMEORIGIN' }
  ];

  var AUDIT_LOGS = [
    { time: '03 Sep 2026 17:40', user: 'SecAnalyst_01', action: 'VAPT-001 status changed: Open -> In Progress' },
    { time: '02 Sep 2026 14:15', user: 'LeadAuditor', action: 'Retest recorded for VAPT-004: PASS' },
    { time: '01 Sep 2026 09:30', user: 'DevOps_Admin', action: 'Security Headers audit report generated' }
  ];

  var state = {
    findings: INITIAL_FINDINGS.slice(),
    filterSeverity: 'ALL',
    filterStatus: 'ALL',
    searchQuery: ''
  };

  function renderMetrics() {
    var total = state.findings.length;
    var critical = 0, high = 0, medium = 0, low = 0, info = 0;

    state.findings.forEach(function (f) {
      if (f.severity === 'CRITICAL') critical++;
      if (f.severity === 'HIGH') high++;
      if (f.severity === 'MEDIUM') medium++;
      if (f.severity === 'LOW') low++;
      if (f.severity === 'INFO') info++;
    });

    var elTotal = document.getElementById('socMetricTotal');
    var elCrit = document.getElementById('socMetricCritical');
    var elHigh = document.getElementById('socMetricHigh');
    var elMed = document.getElementById('socMetricMedium');
    var elLow = document.getElementById('socMetricLow');

    if (elTotal) elTotal.textContent = total;
    if (elCrit) elCrit.textContent = critical;
    if (elHigh) elHigh.textContent = high;
    if (elMed) elMed.textContent = medium;
    if (elLow) elLow.textContent = low + info;
  }

  function getBadgeHtml(sev) {
    var cls = 'vapt-badge-info';
    if (sev === 'CRITICAL') cls = 'vapt-badge-critical';
    if (sev === 'HIGH') cls = 'vapt-badge-high';
    if (sev === 'MEDIUM') cls = 'vapt-badge-medium';
    if (sev === 'LOW') cls = 'vapt-badge-low';
    return '<span class="vapt-badge ' + cls + '">' + sev + '</span>';
  }

  function renderTable() {
    var tbody = document.getElementById('socTableBody');
    if (!tbody) return;

    var filtered = state.findings.filter(function (f) {
      var matchSev = state.filterSeverity === 'ALL' || f.severity === state.filterSeverity;
      var matchStat = state.filterStatus === 'ALL' || f.status === state.filterStatus;
      var matchSearch = !state.searchQuery ||
        f.id.toLowerCase().indexOf(state.searchQuery) !== -1 ||
        f.title.toLowerCase().indexOf(state.searchQuery) !== -1 ||
        f.asset.toLowerCase().indexOf(state.searchQuery) !== -1;

      return matchSev && matchStat && matchSearch;
    });

    tbody.innerHTML = '';

    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--on-dark-muted)">No matching vulnerability findings located.</td></tr>';
      return;
    }

    filtered.forEach(function (f) {
      var tr = document.createElement('tr');
      tr.innerHTML = [
        '<td><strong>' + f.id + '</strong></td>',
        '<td><strong>' + f.title + '</strong><br/><small style="color:var(--on-dark-muted)">CVSS ' + f.cvss + '</small></td>',
        '<td>' + getBadgeHtml(f.severity) + '</td>',
        '<td><code>' + f.asset + '</code></td>',
        '<td><span class="vapt-chip" style="font-size:0.7rem;padding:2px 8px;">' + f.status + '</span></td>',
        '<td>' + f.date + '</td>',
        '<td><button class="btn btn-primary btn-sm soc-view-btn" data-id="' + f.id + '">Inspect</button></td>'
      ].join('');
      tbody.appendChild(tr);
    });
  }

  function renderHeaders() {
    var container = document.getElementById('socHeadersContainer');
    if (!container) return;

    container.innerHTML = '';
    SECURITY_HEADERS.forEach(function (h) {
      var card = document.createElement('div');
      card.className = 'card';
      card.style.background = 'var(--navy-800)';
      card.style.border = '1px solid rgba(199, 211, 224, 0.16)';
      card.style.padding = '14px';

      var badgeClass = h.status === 'PASS' ? 'vapt-badge-info' : h.status === 'WARN' ? 'vapt-badge-high' : 'vapt-badge-medium';

      card.innerHTML = [
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">',
        '  <strong style="color:var(--on-dark);">' + h.name + '</strong>',
        '  <span class="vapt-badge ' + badgeClass + '">' + h.status + '</span>',
        '</div>',
        '<div style="font-size:0.8rem;color:var(--on-dark-body)">Current: <code>' + h.val + '</code></div>',
        '<div style="font-size:0.78rem;color:var(--on-dark-muted);margin-top:4px;">Expected: <code>' + h.expected + '</code></div>'
      ].join('');

      container.appendChild(card);
    });
  }

  function showFindingModal(id) {
    var item = state.findings.filter(function (f) { return f.id === id; })[0];
    if (!item) return;

    var overlay = document.getElementById('socModalOverlay');
    var card = document.getElementById('socModalCard');
    if (!overlay || !card) return;

    card.innerHTML = [
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;border-bottom:1px solid rgba(199, 211, 224, 0.16);padding-bottom:12px;">',
      '  <h3 style="margin:0;color:var(--on-dark);">' + item.id + ': ' + item.title + '</h3>',
      '  <button id="socModalClose" class="vapt-panel-btn">&times;</button>',
      '</div>',
      '<div style="margin-bottom:16px;">',
      '  <span style="margin-right:8px;">' + getBadgeHtml(item.severity) + '</span>',
      '  <span style="font-size:0.85rem;color:var(--on-dark-muted)">CVSS ' + item.cvss + ' &middot; Asset: <code>' + item.asset + '</code></span>',
      '</div>',
      '<h4 style="color:var(--on-dark);margin:12px 0 4px;">Description</h4>',
      '<p style="font-size:0.88rem;">' + item.description + '</p>',
      '<h4 style="color:var(--on-dark);margin:12px 0 4px;">Potential Business Impact</h4>',
      '<p style="font-size:0.88rem;">' + item.impact + '</p>',
      '<h4 style="color:var(--on-dark);margin:12px 0 4px;">Recommended Remediation</h4>',
      '<p style="font-size:0.88rem;">' + item.remediation + '</p>',
      '<div style="display:flex;gap:10px;margin-top:24px;border-top:1px solid rgba(199, 211, 224, 0.16);padding-top:16px;">',
      '  <button id="socAskAssistantBtn" class="btn btn-primary" data-id="' + item.id + '" data-title="' + item.title + '">💬 Ask Assistant About This Finding</button>',
      '  <button id="socRecordRetestBtn" class="btn btn-ghost" data-id="' + item.id + '">Record Retest</button>',
      '</div>'
    ].join('\n');

    overlay.classList.add('is-open');

    document.getElementById('socModalClose').addEventListener('click', function () {
      overlay.classList.remove('is-open');
    });

    document.getElementById('socAskAssistantBtn').addEventListener('click', function () {
      overlay.classList.remove('is-open');
      var trigger = document.getElementById('vaptAssistantTrigger');
      var panel = document.getElementById('vaptAssistantPanel');
      if (trigger && panel) {
        panel.classList.add('is-active');
        var input = document.getElementById('vaptInput');
        if (input) {
          input.value = 'How do I remediate finding ' + item.id + ' (' + item.title + ')?';
          var sendBtn = document.getElementById('vaptSendBtn');
          if (sendBtn) sendBtn.click();
        }
      }
    });

    document.getElementById('socRecordRetestBtn').addEventListener('click', function () {
      alert('Retest status recorded for ' + item.id + ': PASS (Verified on 03 Sep 2026)');
      item.status = 'Verified';
      renderTable();
      renderMetrics();
      overlay.classList.remove('is-open');
    });
  }

  function bindControls() {
    var search = document.getElementById('socSearchInput');
    var selSev = document.getElementById('socSelectSeverity');
    var selStat = document.getElementById('socSelectStatus');
    var exportBtn = document.getElementById('socExportReportBtn');

    if (search) {
      search.addEventListener('input', function (e) {
        state.searchQuery = (e.target.value || '').toLowerCase().trim();
        renderTable();
      });
    }

    if (selSev) {
      selSev.addEventListener('change', function (e) {
        state.filterSeverity = e.target.value;
        renderTable();
      });
    }

    if (selStat) {
      selStat.addEventListener('change', function (e) {
        state.filterStatus = e.target.value;
        renderTable();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        var reportJson = JSON.stringify(state.findings, null, 2);
        var blob = new Blob([reportJson], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'VAPT_Audit_Report_' + (new Date().toISOString().slice(0, 10)) + '.json';
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    document.addEventListener('click', function (e) {
      if (e.target && e.target.classList.contains('soc-view-btn')) {
        var id = e.target.getAttribute('data-id');
        showFindingModal(id);
      }
    });
  }

  function init() {
    renderMetrics();
    renderTable();
    renderHeaders();
    bindControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
