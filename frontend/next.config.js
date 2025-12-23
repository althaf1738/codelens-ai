/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Avoid bundling native tree-sitter binaries; require them at runtime instead.
      config.externals.push({
        "tree-sitter": "commonjs tree-sitter",
        "tree-sitter-typescript": "commonjs tree-sitter-typescript"
      });
    }
    return config;
  }
};

module.exports = nextConfig;
