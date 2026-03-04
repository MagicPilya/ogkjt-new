import path from 'path';
import { mergeConfig, type UserConfig } from 'vite';

export default (config: UserConfig) => {
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': '/src',
        // Заглушка postcss для браузера: sanitize-html (Content Manager) тянет postcss,
        // который использует path/fs/url — в браузере они externalized и падают.
        postcss: path.resolve(process.cwd(), 'src/admin/postcss-browser-stub.js'),
      },
    },
  });
};
