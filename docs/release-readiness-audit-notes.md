# Lumae Release-Readiness Audit Notes

## Browser verification

On 2026-08-22, the public `/delete-account` route was requested from the development preview after the page and route were added. The browser did not retain the preview page and subsequently reported `about:blank`, so visual verification is **inconclusive**. The route is covered by source-level regression checks and TypeScript validation; development-server state must be rechecked before final release verification.

## Confirmed Android configuration

The manifest declares only `INTERNET`, enforces `usesCleartextTraffic="false"`, and defines a `https://lumae.co.in` App Link. The Gradle configuration uses package `in.lumae.app`, enables minification and resource shrinking for release builds, and targets API 36. The App Link certificate association remains owner-controlled until Play App Signing provides the release SHA-256 certificate.

## Identified remediation

The previous account deletion procedure did not erase all later-added user-scoped security, content, business, and scheduling records. It has been replaced with transactional comprehensive erasure, durable schedule cancellation, an authenticated Settings control, and a public web deletion-information route. Web AdSense and Google Analytics now load only after full cookie consent on the web and are excluded from the packaged Capacitor Android container.

The final audited unsigned App Bundle was rebuilt successfully on 2026-08-22 after synchronized web assets. Its SHA-256 is `821f15931eaee287849edd556ce6445ee008a7a2a5865acb54f1d77c5161b214`. Full application validation completed with 47 test files and 558 passing tests. Production dependency audit reported no critical or high findings; 12 low and 32 moderate findings remain for routine maintenance.
