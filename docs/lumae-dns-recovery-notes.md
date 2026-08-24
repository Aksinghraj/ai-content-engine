# Lumae DNS Recovery Notes

Checked 2026-08-24 using Cloudflare DNS-over-HTTPS.

- `lumae.co.in` delegates to GoDaddy nameservers `ns27.domaincontrol.com` and `ns28.domaincontrol.com`.
- The apex `lumae.co.in` currently returns no A record, which explains `DNS_PROBE_FINISHED_NXDOMAIN`.
- The GoDaddy zone has `www` configured as a CNAME to `lumae.co.in`; this also fails until the missing apex record is restored.
- The owner-provided GoDaddy record table confirms no apex A record is present.
- The active Lumae Manus hosting targets resolve as follows:
  - `lumae.manus.space` → `104.19.168.112`, `104.19.169.112`
  - `aicontent-femeuybh.manus.space` → `104.19.168.112`, `104.19.169.112`

Direct HTTPS verification on 2026-08-24 confirmed that both addresses serve the configured Lumae custom domain: `https://lumae.co.in` returns the Lumae application and `https://www.lumae.co.in` redirects safely to the apex. A GoDaddy parking response seen through one proxied test path was stale or intermediary-specific and is not the direct public route.

The `mail.lumae.co.in` Resend DKIM/SPF/MX records are separate subdomain records and must be preserved during web-record recovery.
