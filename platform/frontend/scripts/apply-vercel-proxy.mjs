/**
 * Writes vercel.json rewrites so /api/* proxies to the HF backend.
 * VITE_API_URL is only used at build time (not embedded in the client bundle).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiUrl = (process.env.VITE_API_URL || "").replace(/\/$/, "");

const config = {
  rewrites: apiUrl
    ? [
        { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
        { source: "/(.*)", destination: "/index.html" },
      ]
    : [{ source: "/(.*)", destination: "/index.html" }],
  headers: [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
      ],
    },
  ],
};

fs.writeFileSync(path.join(root, "vercel.json"), JSON.stringify(config, null, 2) + "\n");

if (apiUrl) {
  console.log(`vercel.json: /api/* → ${apiUrl}/api/*`);
} else {
  console.warn(
    "vercel.json: VITE_API_URL not set — no API proxy. Set it in Vercel env and redeploy."
  );
}
