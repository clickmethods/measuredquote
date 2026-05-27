/*!
 * MeasuredQuote embeddable widget loader — v1
 *
 * Drop this single <script> tag onto any contractor website to embed the
 * MeasuredQuote estimator. It mounts a sandboxed iframe that points at the
 * tenant-scoped widget URL; the iframe handles its own auth via the widget
 * token stamped onto the URL.
 *
 * Usage (preferred — auto-init via data-attributes on the script tag):
 *
 *   <script
 *     src="https://embed.measuredquote.com/v1/widget.js"
 *     data-mq-tenant="ten_xxxxxxxxxxxx"
 *     data-mq-trade="concrete"
 *     data-mq-language="en"
 *     data-mq-mount="#mq-estimator"
 *     async
 *   ></script>
 *
 * Or call programmatically:
 *
 *   <script src="https://embed.measuredquote.com/v1/widget.js" async></script>
 *   <script>
 *     MeasuredQuote.mount({
 *       tenant: 'ten_xxxxxxxxxxxx',
 *       trade: 'concrete',
 *       language: 'en',
 *       target: '#mq-estimator',
 *     });
 *   </script>
 *
 * The widget never touches the host page's DOM beyond the mount target and
 * never requests cross-origin cookies. All state lives inside the iframe.
 */
(function () {
  "use strict";

  // The default host can be overridden via window.__MQ_HOST before this
  // script loads, useful for staging environments.
  var DEFAULT_HOST = "https://embed.measuredquote.com";
  var HOST =
    (typeof window !== "undefined" && window.__MQ_HOST) ||
    (function () {
      // Derive host from this script's src so a single-tenant Netlify deploy
      // can host both the widget script and the iframe page from one origin.
      try {
        var scripts = document.getElementsByTagName("script");
        for (var i = scripts.length - 1; i >= 0; i--) {
          var s = scripts[i];
          if (s.src && s.src.indexOf("/widget/v1/widget.js") !== -1) {
            return new URL(".", s.src).origin;
          }
        }
      } catch (_) {}
      return DEFAULT_HOST;
    })();

  function escapeAttr(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c
      );
    });
  }

  function buildIframeUrl(opts) {
    var url = HOST + "/#/embed";
    var params = [];
    if (opts.tenant) params.push("tenant=" + encodeURIComponent(opts.tenant));
    if (opts.trade) params.push("trade=" + encodeURIComponent(opts.trade));
    if (opts.language) params.push("lang=" + encodeURIComponent(opts.language));
    if (opts.token) params.push("t=" + encodeURIComponent(opts.token));
    if (opts.theme) params.push("theme=" + encodeURIComponent(opts.theme));
    return params.length ? url + "?" + params.join("&") : url;
  }

  function resolveTarget(target) {
    if (!target) return null;
    if (typeof target === "string") return document.querySelector(target);
    if (target.nodeType === 1) return target;
    return null;
  }

  function mount(opts) {
    opts = opts || {};
    if (!opts.tenant) {
      console.warn("[MeasuredQuote] mount() requires { tenant: '...' }");
      return null;
    }

    var host = resolveTarget(opts.target) || (function () {
      var el = document.createElement("div");
      el.id = "mq-estimator";
      document.body.appendChild(el);
      return el;
    })();

    // Clear and prepare the host element
    host.style.position = "relative";
    if (!host.style.minHeight) host.style.minHeight = "680px";
    host.innerHTML = "";

    var iframe = document.createElement("iframe");
    iframe.src = buildIframeUrl(opts);
    iframe.title = "MeasuredQuote estimator";
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("allow", "geolocation");
    // No allow-top-navigation so embedded sites stay safe.
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox",
    );
    iframe.style.cssText =
      "border:0;width:100%;height:100%;min-height:680px;background:transparent;display:block;";
    host.appendChild(iframe);

    // Auto-resize via postMessage from the inner page.
    function onMessage(ev) {
      try {
        var iframeOrigin = new URL(iframe.src).origin;
        if (ev.origin !== iframeOrigin) return;
        var data = ev.data || {};
        if (data && data.source === "measuredquote") {
          if (data.type === "resize" && typeof data.height === "number") {
            iframe.style.height = Math.max(480, data.height) + "px";
            host.style.minHeight = Math.max(480, data.height) + "px";
          }
          if (data.type === "lead.created" && typeof opts.onLead === "function") {
            try { opts.onLead(data.lead); } catch (_) {}
          }
        }
      } catch (_) {}
    }
    window.addEventListener("message", onMessage);

    return {
      iframe: iframe,
      destroy: function () {
        window.removeEventListener("message", onMessage);
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      },
    };
  }

  // Auto-init from data attributes on the loader <script> tag.
  function autoInit() {
    try {
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i];
        if (!s.src || s.src.indexOf("/widget/v1/widget.js") === -1) continue;
        var tenant = s.getAttribute("data-mq-tenant");
        if (!tenant) continue;
        var trade = s.getAttribute("data-mq-trade") || undefined;
        var lang = s.getAttribute("data-mq-language") || undefined;
        var token = s.getAttribute("data-mq-token") || undefined;
        var theme = s.getAttribute("data-mq-theme") || undefined;
        var target = s.getAttribute("data-mq-mount") || undefined;
        mount({
          tenant: tenant,
          trade: trade,
          language: lang,
          token: token,
          theme: theme,
          target: target,
        });
      }
    } catch (err) {
      // Silently ignore; partial host pages will still get the global.
    }
  }

  var api = { mount: mount, version: "1.0.0", host: HOST };

  if (typeof window !== "undefined") {
    // Expose as a global; preserve existing namespace if multiple loads occur.
    window.MeasuredQuote = window.MeasuredQuote || api;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
})();
