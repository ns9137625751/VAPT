# Connecting the forms

Two forms collect leads:

| Form | Page | Attribute to fill |
|---|---|---|
| Get a VAPT quote | `index.html` | `<form ... data-lead-form data-endpoint="">` |
| Request an assessment | `contact.html` | `<form ... data-validate data-endpoint="">` |

Both are live and validated but **submit nowhere** until you put a URL in
`data-endpoint`. Until then they say so plainly rather than pretending to send.

---

## Formspree — quickest

1. Create a form at formspree.io, copy the endpoint.
2. Paste it into both forms:

```html
<form class="wizard reveal" data-lead-form
      data-endpoint="https://formspree.io/f/YOURID" novalidate>
```

Nothing else changes. The handler already POSTs `FormData` with
`Accept: application/json`, which is what Formspree expects.

## Netlify Forms

Needs two extra attributes on the `<form>` itself and no endpoint:

```html
<form name="quote" method="POST" data-netlify="true" data-lead-form novalidate>
  <input type="hidden" name="form-name" value="quote">
```

Then remove `data-endpoint` so the handler falls through to a normal submit,
or point `data-endpoint` at `/` and let Netlify capture the POST.

## Your own endpoint

Any URL that accepts a `multipart/form-data` POST and returns 2xx works.
The handler treats a non-2xx response as a failure and tells the user to email
instead.

---

## What is already handled

- **Inline validation** — required fields and email format, checked on blur and
  again on submit, with the first bad field focused.
- **Sending state** — the button disables and reads "Sending…" so nobody
  double-submits.
- **Honest failure** — a network error or non-2xx shows a message telling the
  user to email directly, instead of silently losing the lead.
- **Two spam checks** — a `_gotcha` honeypot positioned off-screen (not
  `display:none`, which many bots skip), and a three-second minimum fill time.

## What is NOT handled, and cannot be here

Everything in this file is client-side. It is convenience, **not security**.

The server receiving these submissions still has to:

- validate and sanitise every field again, server side
- rate-limit by IP
- apply its own spam filtering — the honeypot stops crude bots, nothing more
- set the security headers from the brief (CSP, HSTS, X-Content-Type-Options,
  Referrer-Policy), which a static host configures, not the page

A determined submitter bypasses every check in the browser by POSTing to the
endpoint directly. Treat everything that arrives as untrusted.

## One thing to keep

The privacy line under the form:

> Never send passwords, API keys or production credentials through this form.

Leave it in. It is the correct instruction for a security vendor to give, and
the form should never become a channel for secrets.
