/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./prompts/**/*"]
  },
  reactStrictMode: true
};

export default nextConfig;
