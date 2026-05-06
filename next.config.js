/** @type {import('next').NextConfig} */
const fs = require("fs");
const path = require("path");

const imageDomains = ["i.dummyjson.com", "i.stack.imgur.com", "res.cloudinary.com", "i.im.ge", "cdn.insforge.dev"];

const insforgeBaseUrl = process.env.INSFORGE_STORAGE_PUBLIC_BASE_URL || process.env.INSFORGE_STORAGE_BASE_URL || process.env.INSFORGE_BASE_URL;

function addHostFromUrl(urlValue) {
  if (!urlValue) {
    return;
  }
  try {
    const host = new URL(urlValue).hostname;
    if (host && !imageDomains.includes(host)) {
      imageDomains.push(host);
    }
  } catch {
    // ignore invalid URL
  }
}

function addHostFromInsforgeProject() {
  try {
    const projectPath = path.join(process.cwd(), ".insforge", "project.json");
    if (!fs.existsSync(projectPath)) {
      return;
    }
    const project = JSON.parse(fs.readFileSync(projectPath, "utf8"));
    addHostFromUrl(project?.oss_host);
  } catch {
    // ignore read/parse errors
  }
}

addHostFromUrl(insforgeBaseUrl);
addHostFromInsforgeProject();

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: imageDomains
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const upstream = process.env.INSFORGE_BASE_URL || "http://insforge:7130";
    // Proxy all client-side InsForge calls through the Next.js server so no
    // localhost URLs leak into the browser bundle.
    return [
      {
        source: "/api/insforge/:path*",
        destination: `${upstream}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig
