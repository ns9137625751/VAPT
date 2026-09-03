/* ==========================================================================
   VAPT SECURITY ASSISTANT JS
   Context-aware AI Security Consultant for authorized VAPT & Defensive Audits.
   ========================================================================== */

(function () {
  'use strict';

  // --- Defensive Security Guardrails & Knowledge Base ---
  var DEFENSIVE_GUARDRAIL = "I am configured specifically for authorized security testing, defensive vulnerability management, and remediation guidance. I do not perform or generate unauthorized attack scripts, credential harvesting, or malware deployment.";

  var VULN_KNOWLEDGE = {
    'sqli': {
      title: 'SQL Injection (SQLi)',
      cve: 'CWE-89 / OWASP A03:2021',
      severity: 'CRITICAL',
      cvss: '9.8',
      summary: 'Untrusted user input reaches backend database queries without parametrization, allowing unauthorized data access, modification, or deletion.',
      impact: 'Full compromise of database confidentiality, integrity, and operational availability.',
      remediation: 'Implement Parameterized Queries (Prepared Statements) or ORM binding across all database abstraction layers.',
      fixCode: 'SELECT * FROM users WHERE username = ? AND password_hash = ?;',
      retest: 'Send payloads (e.g. \x27 OR 1=1 --) to confirm endpoint returns 400/200 without syntax errors or unescaped query execution.'
    },
    'xss': {
      title: 'Cross-Site Scripting (XSS)',
      cve: 'CWE-79 / OWASP A03:2021',
      severity: 'HIGH',
      cvss: '7.2',
      summary: 'Application renders unescaped user input in the browser DOM, allowing malicious JavaScript execution in victim user sessions.',
      impact: 'Session hijacking, token theft, page defacement, and unauthorized user impersonation.',
      remediation: 'Apply contextual HTML entity encoding on output, set Content-Security-Policy (CSP) headers, and use HttpOnly session cookies.',
      fixCode: 'element.textContent = sanitizeInput(userInput);',
      retest: 'Inject test strings (<script>alert(1)</script>) and verify DOM encodes characters as &lt;script&gt;.'
    },
    'idor': {
      title: 'Insecure Direct Object Reference (IDOR)',
      cve: 'CWE-639 / OWASP A01:2021',
      severity: 'HIGH',
      cvss: '8.1',
      summary: 'Backend endpoints expose internal database IDs without validating if the authenticated requester owns the resource.',
      impact: 'Unauthorized access and leakage of sensitive data across tenant accounts.',
      remediation: 'Implement server-side authorization checks verifying session identity against resource owner ID before query execution.',
      fixCode: 'if (resource.ownerId !== req.user.id) { throw new ForbiddenError(); }',
      retest: 'Change URL parameter (e.g. /api/user/102 -> /api/user/103) with user token A and verify 403 Forbidden response.'
    },
    'headers': {
      title: 'Security Headers Audit',
      cve: 'OWASP A05:2021',
      severity: 'MEDIUM',
      cvss: '5.3',
      summary: 'Missing modern HTTP security response headers weakens browser-level defenses against clickjacking, XSS, and downgrade attacks.',
      impact: 'Increased susceptibility to client-side attacks.',
      remediation: 'Configure Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options: nosniff, Referrer-Policy, and X-Frame-Options: DENY.',
      fixCode: 'Header set Content-Security-Policy "default-src \x27self\x27; script-src \x27self\x27;"\nHeader set Strict-Transport-Security "max-age=31536000; includeSubDomains"',
      retest: 'Inspect response headers via curl -I or browser DevTools network tab.'
    },
    'jwt': {
      title: 'API Authentication & Token Security',
      cve: 'CWE-287 / OWASP A07:2021',
      severity: 'HIGH',
      cvss: '8.2',
      summary: 'Weak token verification (algorithm "none", weak HMAC secret, or missing expiration check) allows authorization bypass.',
      impact: 'Complete administrative authentication bypass.',
      remediation: 'Enforce strong RS256/ES256 signature validation, set short token lifetime with refresh tokens, and store session tokens in HttpOnly SameSite=Strict cookies.',
      fixCode: 'jwt.verify(token, process.env.JWT_PUBLIC_KEY, { algorithms: ["RS256"] });',
      retest: 'Send modified token payload with "alg": "none" or tampered signature and verify 401 Unauthorized.'
    }
  };

  // --- Assistant DOM Creation ---
  function createWidget() {
    if (document.getElementById('vaptAssistantTrigger')) return;

    var trigger = document.createElement('button');
    trigger.id = 'vaptAssistantTrigger';
    trigger.className = 'vapt-assistant-trigger';
    trigger.setAttribute('aria-label', 'Open VAPT Security Assistant');
    trigger.innerHTML = '<span class="pulse-dot"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4M12 16h.01"/></svg><span>VAPT Assistant</span>';

    var panel = document.createElement('div');
    panel.id = 'vaptAssistantPanel';
    panel.className = 'vapt-assistant-panel';
    panel.innerHTML = [
      '<div class="vapt-panel-header">',
      '  <div class="vapt-panel-title">',
      '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      '    <div>',
      '      <h3 class="vapt-panel-title-text">VAPT Security Assistant</h3>',
      '      <span class="vapt-panel-status">● Ready to assist &middot; SOC Active</span>',
      '    </div>',
      '  </div>',
      '  <div class="vapt-panel-controls">',
      '    <button id="vaptMinimizeBtn" class="vapt-panel-btn" title="Minimize">&minus;</button>',
      '    <button id="vaptCloseBtn" class="vapt-panel-btn" title="Close">&times;</button>',
      '  </div>',
      '</div>',
      '<div id="vaptPanelBody" class="vapt-panel-body">',
      '  <div class="vapt-welcome-card">',
      '    <h4>🛡️ VAPT Security Assistant</h4>',
      '    <p>Hello! I am your authorized VAPT Security Assistant. I can help analyze security findings, calculate risk scores, review OWASP Top 10 controls, check headers, and provide remediation guidance.</p>',
      '    <div class="vapt-quick-chips">',
      '      <span class="vapt-chip" data-query="/findings">Analyze Finding</span>',
      '      <span class="vapt-chip" data-query="/headers">Check Headers</span>',
      '      <span class="vapt-chip" data-query="/owasp">OWASP Checklist</span>',
      '      <span class="vapt-chip" data-query="/api">API Security</span>',
      '      <span class="vapt-chip" data-query="/report">VAPT Report</span>',
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="vapt-panel-footer">',
      '  <div class="vapt-input-row">',
      '    <input id="vaptInput" class="vapt-input" type="text" placeholder="Ask about findings, headers, OWASP, or type /help..." autocomplete="off" />',
      '    <button id="vaptSendBtn" class="vapt-send-btn" title="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>',
      '  </div>',
      '  <div class="vapt-input-hints">',
      '    <span>Commands: <strong class="vapt-cmd-hint" data-query="/help">/help</strong>, <strong class="vapt-cmd-hint" data-query="/critical">/critical</strong>, <strong class="vapt-cmd-hint" data-query="/headers">/headers</strong></span>',
      '    <span>Defensive VAPT v2.4</span>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(trigger);
    document.body.appendChild(panel);

    bindEvents(trigger, panel);
  }

  function bindEvents(trigger, panel) {
    var input = document.getElementById('vaptInput');
    var sendBtn = document.getElementById('vaptSendBtn');
    var closeBtn = document.getElementById('vaptCloseBtn');
    var minBtn = document.getElementById('vaptMinimizeBtn');
    var body = document.getElementById('vaptPanelBody');

    trigger.addEventListener('click', function () {
      panel.classList.toggle('is-active');
      panel.classList.remove('is-minimized');
      if (panel.classList.contains('is-active')) {
        input.focus();
      }
    });

    closeBtn.addEventListener('click', function () {
      panel.classList.remove('is-active');
    });

    minBtn.addEventListener('click', function () {
      panel.classList.toggle('is-minimized');
    });

    sendBtn.addEventListener('click', function () {
      handleSend();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleSend();
    });

    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('vapt-chip') || e.target.classList.contains('vapt-cmd-hint')) {
        var query = e.target.getAttribute('data-query');
        if (query) {
          input.value = query;
          handleSend();
        }
      }
    });
  }

  function formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\[CRITICAL\]/g, '<span class="vapt-badge vapt-badge-critical">CRITICAL</span>')
      .replace(/\[HIGH\]/g, '<span class="vapt-badge vapt-badge-high">HIGH</span>')
      .replace(/\[MEDIUM\]/g, '<span class="vapt-badge vapt-badge-medium">MEDIUM</span>')
      .replace(/\[LOW\]/g, '<span class="vapt-badge vapt-badge-low">LOW</span>')
      .replace(/\[INFO\]/g, '<span class="vapt-badge vapt-badge-info">INFO</span>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  }

  function addMessage(sender, text) {
    var body = document.getElementById('vaptPanelBody');
    var div = document.createElement('div');
    div.className = 'vapt-msg ' + (sender === 'user' ? 'vapt-msg-user' : 'vapt-msg-assistant');
    div.innerHTML = formatMarkdown(text);
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    var body = document.getElementById('vaptPanelBody');
    var typing = document.createElement('div');
    typing.id = 'vaptTypingIndicator';
    typing.className = 'vapt-typing';
    typing.innerHTML = '<span class="vapt-typing-dot"></span><span class="vapt-typing-dot"></span><span class="vapt-typing-dot"></span><span style="font-size:0.75rem;margin-left:4px;color:var(--on-dark-muted)">Analyzing vulnerability context...</span>';
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;
  }

  function removeTyping() {
    var t = document.getElementById('vaptTypingIndicator');
    if (t) t.remove();
  }

  function handleSend() {
    var input = document.getElementById('vaptInput');
    var query = (input.value || '').trim();
    if (!query) return;

    addMessage('user', query);
    input.value = '';
    showTyping();

    setTimeout(function () {
      removeTyping();
      var reply = generateAssistantReply(query);
      addMessage('assistant', reply);
    }, 600);
  }

  // --- Context Awareness & Assistant Logic ---
  function getPageContext() {
    var path = window.location.pathname.toLowerCase();
    var title = document.title || '';
    if (path.indexOf('service-api') !== -1) return 'API Security Testing';
    if (path.indexOf('service-web') !== -1) return 'Web Application VAPT';
    if (path.indexOf('service-network') !== -1) return 'Network Security Assessment';
    if (path.indexOf('service-cloud') !== -1) return 'Cloud Security Assessment';
    if (path.indexOf('service-mobile') !== -1) return 'Mobile Application VAPT';
    if (path.indexOf('dashboard') !== -1) return 'VAPT SOC Dashboard';
    if (path.indexOf('reports') !== -1) return 'VAPT Deliverables & Reports';
    return 'VAPT Platform (' + title + ')';
  }

  function generateAssistantReply(query) {
    var q = query.toLowerCase();
    var context = getPageContext();

    // Guardrail Check
    if (q.indexOf('hack') !== -1 || q.indexOf('exploit third party') !== -1 || q.indexOf('steal credentials') !== -1 || q.indexOf('ddos') !== -1 || q.indexOf('malware') !== -1) {
      return '⚠️ **Defensive Security Notice**\n\n' + DEFENSIVE_GUARDRAIL + '\n\nI can assist you with vulnerability remediation, OWASP code hardening, CVSS risk scoring, and defensive retesting under authorized scope.';
    }

    // Slash Commands
    if (q === '/help') {
      return '📋 **VAPT Security Assistant Commands**\n\n- `/findings` : List open vulnerabilities\n- `/critical` : Filter critical risk items\n- `/high` : Filter high severity items\n- `/owasp` : OWASP Top 10 defensive checklist\n- `/headers` : Security headers audit recommendations\n- `/api` : API security verification guide\n- `/auth` : Authentication & session checklist\n- `/report` : Generate VAPT report summary';
    }

    if (q === '/critical') {
      return '🚨 **Critical Risk Findings (Action Required)**\n\n1. **VAPT-001: SQL Injection in Search Endpoint** [CRITICAL] (CVSS 9.8)\n   - *Impact*: Direct database query manipulation.\n   - *Remediation*: Implement Parameterized Queries.\n\n2. **VAPT-003: Unauthenticated Remote API Execution** [CRITICAL] (CVSS 9.6)\n   - *Impact*: Administrative privileges bypass.\n   - *Remediation*: Enforce JWT signature verification & role check.';
    }

    if (q === '/findings' || q.indexOf('analyze finding') !== -1 || q.indexOf('analyze my vulnerability') !== -1) {
      var item = VULN_KNOWLEDGE['sqli'];
      return '### Vulnerability Analysis: ' + item.title + '\n\n**Severity**: [' + item.severity + '] (CVSS ' + item.cvss + ')\n**Classification**: `' + item.cve + '`\n\n**Assessment**\n' + item.summary + '\n\n**Impact**\n' + item.impact + '\n\n**Recommended Remediation**\n' + item.remediation + '\n\n```sql\n' + item.fixCode + '\n```\n\n**Verification & Retest**\n' + item.retest;
    }

    if (q === '/headers' || q.indexOf('headers') !== -1) {
      var h = VULN_KNOWLEDGE['headers'];
      return '### Security Headers Guidance\n\n**Classification**: [' + h.severity + '] (CVSS ' + h.cvss + ')\n\n' + h.summary + '\n\n**Recommended Configuration**\n```apache\n' + h.fixCode + '\n```\n\n**Verification**: Run `curl -I https://your-domain.com` or inspect network headers in DevTools.';
    }

    if (q === '/owasp' || q.indexOf('owasp') !== -1) {
      return '🛡️ **OWASP Top 10 Defensive Checklist**\n\n1. **A01:2021 Broken Access Control**: Verify object-level ownership server-side.\n2. **A02:2021 Cryptographic Failures**: Enforce TLS 1.3, AES-256-GCM, and bcrypt password hashing.\n3. **A03:2021 Injection**: Use parameterized statements & context output encoding.\n4. **A04:2021 Insecure Design**: Perform threat modeling during architecture design.\n5. **A05:2021 Security Misconfiguration**: Disable verbose stack traces & default credentials.';
    }

    if (q === '/api' || q.indexOf('api') !== -1) {
      var jwt = VULN_KNOWLEDGE['jwt'];
      return '### API Security Review & Token Validation\n\n**Focus Area**: `' + context + '`\n**Severity**: [' + jwt.severity + '] (CVSS ' + jwt.cvss + ')\n\n**Defensive Requirements**\n- Verify JWT signature with strong secret/public key.\n- Enforce strict rate limiting (e.g. 100 requests / minute per IP/token).\n- Store tokens in `HttpOnly; Secure; SameSite=Strict` cookies.\n\n```js\n' + jwt.fixCode + '\n```';
    }

    if (q === '/report' || q.indexOf('report') !== -1) {
      return '📊 **VAPT Executive & Technical Summary**\n\n**Scope**: ' + context + '\n**Total Findings**: 8 Active Items (2 Critical, 3 High, 2 Medium, 1 Low)\n**Remediation Progress**: 62% Completed\n**Retest Status**: 3 items pending retest verification.\n\n*Click "SOC Dashboard" or use the VAPT Report Generator to export as PDF / JSON / CSV.*';
    }

    // Contextual Fallback Response
    if (q.indexOf('how do i fix') !== -1 || q.indexOf('fix') !== -1) {
      return '### Defensive Remediation Steps\n\nBased on your current context (**' + context + '**):\n\n1. **Root Cause Isolation**: Audit input parameters and server-side validation functions.\n2. **Defensive Control**: Apply strict type checking, parameterized queries, and output sanitization.\n3. **Retest Validation**: Confirm using automated unit tests and manual regression testing.\n\nType `/findings` or `/critical` for specific vulnerability fix templates.';
    }

    return '### Security Consultant Response\n\nI have received your query regarding: *"' + query + '"* in the context of **' + context + '**.\n\nFor structured guidance, you can use quick slash commands:\n- `/critical` - View critical security risks\n- `/headers` - Security headers recommendations\n- `/owasp` - OWASP Top 10 checklist\n- `/api` - API security controls\n- `/report` - Executive assessment report';
  }

  // --- Initialize Widget ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
