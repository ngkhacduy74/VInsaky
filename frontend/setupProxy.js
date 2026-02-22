const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // REACT_APP_BACKEND_URL=/api/v1 là relative path cho axios — không dùng làm proxy target
  // Proxy target phải là full URL của backend server
  const BACKEND_URL = process.env.BACKEND_PROXY_URL || "http://localhost:4000";

  app.use(
    ["/auth", "/otp", "/user", "/product", "/post", "/file", "/chat", "/banner", "/favorite", "/search-history"],
    createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
      logLevel: "debug",
      onProxyReq: (proxyReq, req) => {
        console.log(`[Proxy] ${req.method} ${req.path} → ${BACKEND_URL}${req.path}`);
      },
    })
  );
};
