import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deshabilita Turbopack y fuerza el uso de Webpack
  turbopack: {
    enabled: false,
    root: projectRoot
  }
};

export default withNextIntl(nextConfig);
