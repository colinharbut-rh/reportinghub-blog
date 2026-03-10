/**
 * Cloudflare Worker — Blog Path Router
 * =====================================
 * Routes /blog/* requests to Cloudflare Pages
 * while passing all other traffic through to Webflow.
 *
 * Deploy this worker to your thereportinghub.com zone.
 * Set PAGES_URL to your Cloudflare Pages deployment URL.
 */

const WEBFLOW_ORIGIN = "https://thereportinghub.webflow.io";
const PAGES_URL      = "https://reportinghub-blog.pages.dev"; // update after first Pages deploy

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Route /blog and /blog/* to Cloudflare Pages
    if (url.pathname === "/blog" || url.pathname.startsWith("/blog/")) {
      const pagesUrl = new URL(url.pathname + url.search, PAGES_URL);
      const pagesReq = new Request(pagesUrl, {
        method:  request.method,
        headers: request.headers,
        body:    request.body,
      });
      const res = await fetch(pagesReq);
      // Pass response through with original headers
      return new Response(res.body, {
        status:  res.status,
        headers: res.headers,
      });
    }

    // Everything else → Webflow (until full site migration)
    const webflowUrl = new URL(url.pathname + url.search, WEBFLOW_ORIGIN);
    return fetch(new Request(webflowUrl, request));
  },
};
