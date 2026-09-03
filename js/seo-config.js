/* ==========================================================================
   VAPT SECURITY PLATFORM - CENTRALIZED SEO CONFIG & DATA LAYER
   ========================================================================== */

(function (global) {
  'use strict';

  var SEOConfig = {
    site: {
      name: 'VAPT Security',
      domain: 'vapt.example.com',
      baseUrl: 'https://vapt.example.com',
      defaultTitle: 'VAPT Security Testing & Penetration Testing Services | VAPT Security',
      defaultDescription: 'Independent Vulnerability Assessment and Penetration Testing (VAPT) services for web applications, APIs, cloud infrastructure, and mobile apps with risk-based remediation.',
      logoUrl: 'https://vapt.example.com/images/favicon.svg',
      defaultOgImage: 'https://vapt.example.com/images/vapt_hero_bg.jpg'
    },
    organization: {
      name: 'VAPT Security',
      url: 'https://vapt.example.com',
      logo: 'https://vapt.example.com/images/favicon.svg',
      sameAs: [
        'https://github.com/vapt-security',
        'https://linkedin.com/company/vapt-security',
        'https://twitter.com/vapt_security'
      ],
      contactPoint: {
        type: 'ContactPoint',
        telephone: '+1-800-555-VAPT',
        contactType: 'security team',
        availableLanguage: ['English']
      }
    },
    routes: {
      '/': {
        title: 'VAPT Security Testing & Penetration Testing Services | VAPT Security',
        description: 'Enterprise Vulnerability Assessment and Penetration Testing (VAPT) services for web applications, APIs, cloud environments, and mobile apps with actionable remediation.',
        canonical: 'https://vapt.example.com/'
      },
      '/services.html': {
        title: 'Comprehensive VAPT Security Testing Services | VAPT Security',
        description: 'Explore our full spectrum of cybersecurity testing services including Web, API, Mobile, Network, and Cloud Penetration Testing.',
        canonical: 'https://vapt.example.com/services.html'
      },
      '/service-web.html': {
        title: 'Web Application Penetration Testing (WAPT) Services | VAPT Security',
        description: 'Identify SQL injection, XSS, broken access control, and OWASP Top 10 vulnerabilities in your web applications before attackers exploit them.',
        canonical: 'https://vapt.example.com/service-web.html'
      },
      '/service-api.html': {
        title: 'API Security Testing & Vulnerability Assessment | VAPT Security',
        description: 'Deep security testing for REST, GraphQL, and SOAP APIs to secure authentication, authorization, and sensitive payload data.',
        canonical: 'https://vapt.example.com/service-api.html'
      },
      '/service-network.html': {
        title: 'Network Penetration Testing & Infrastructure Audit | VAPT Security',
        description: 'Internal and external network penetration testing to evaluate firewall rules, open ports, legacy services, and active directory posture.',
        canonical: 'https://vapt.example.com/service-network.html'
      },
      '/service-cloud.html': {
        title: 'Cloud Security Assessment & AWS/Azure VAPT | VAPT Security',
        description: 'Cloud infrastructure security reviews for AWS, Azure, and GCP focusing on IAM policies, misconfigurations, and container security.',
        canonical: 'https://vapt.example.com/service-cloud.html'
      },
      '/service-mobile.html': {
        title: 'Mobile Application Security Testing (iOS & Android) | VAPT Security',
        description: 'Static and dynamic security analysis for iOS and Android apps evaluating client storage, TLS pinning, and reverse engineering defenses.',
        canonical: 'https://vapt.example.com/service-mobile.html'
      },
      '/service-compliance.html': {
        title: 'Compliance VAPT Services (ISO 27001, PCI-DSS, SOC 2) | VAPT Security',
        description: 'Audit-ready vulnerability testing to meet compliance mandates for PCI-DSS, ISO 27001, SOC 2, HIPAA, and GDPR.',
        canonical: 'https://vapt.example.com/service-compliance.html'
      },
      '/methodology.html': {
        title: 'VAPT Testing Methodology & Assessment Process | VAPT Security',
        description: 'Learn about our 5-phase structured penetration testing methodology: Reconnaissance, Mapping, Vulnerability Analysis, Exploitation, and Reporting.',
        canonical: 'https://vapt.example.com/methodology.html'
      },
      '/reports.html': {
        title: 'VAPT Sample Audit Reports & Security Deliverables | VAPT Security',
        description: 'Review sample executive and technical penetration testing reports featuring risk severity scores, proof-of-concept evidence, and fix recommendations.',
        canonical: 'https://vapt.example.com/reports.html'
      },
      '/about.html': {
        title: 'About VAPT Security & Lead Cybersecurity Consultants | VAPT Security',
        description: 'Meet our team of certified cybersecurity specialists, penetration testers, and security researchers dedicated to proactive defense.',
        canonical: 'https://vapt.example.com/about.html'
      },
      '/contact.html': {
        title: 'Contact VAPT Security & Request Security Assessment | VAPT Security',
        description: 'Get in touch with our security engineers for a free consultation or to schedule your next penetration testing engagement.',
        canonical: 'https://vapt.example.com/contact.html'
      },
      '/advisories.html': {
        title: 'Security Advisories & Vulnerability Research | VAPT Security',
        description: 'Original cybersecurity research, zero-day analysis, threat intelligence, and security advisories published by our audit team.',
        canonical: 'https://vapt.example.com/advisories.html'
      },
      '/privacy.html': {
        title: 'Privacy Policy | VAPT Security',
        description: 'Our commitment to data protection, privacy compliance, and confidentiality during security testing engagements.',
        canonical: 'https://vapt.example.com/privacy.html'
      },
      '/terms.html': {
        title: 'Terms of Service | VAPT Security',
        description: 'Terms of service, rules of engagement, and legal agreements governing penetration testing and vulnerability assessments.',
        canonical: 'https://vapt.example.com/terms.html'
      },
      '/disclosure.html': {
        title: 'Responsible Vulnerability Disclosure Policy | VAPT Security',
        description: 'Guidelines and PGP encryption details for reporting security vulnerabilities responsibly to our security team.',
        canonical: 'https://vapt.example.com/disclosure.html'
      },
      '/dashboard.html': {
        title: 'SOC Security Operations Center Dashboard | VAPT Security',
        description: 'VAPT SOC Dashboard for managing active vulnerability findings, security header status, and remediation verification.',
        canonical: 'https://vapt.example.com/dashboard.html',
        robots: 'noindex, nofollow'
      }
    },

    getCurrentRouteMeta: function () {
      var path = window.location.pathname.toLowerCase();
      var key = path.substring(path.lastIndexOf('/')) || '/';
      return this.routes[key] || {
        title: this.site.defaultTitle,
        description: this.site.defaultDescription,
        canonical: this.site.baseUrl + key
      };
    }
  };

  global.SEOConfig = SEOConfig;
})(typeof window !== 'undefined' ? window : global);
