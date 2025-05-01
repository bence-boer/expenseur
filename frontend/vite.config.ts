import { sveltekit } from '@sveltejs/kit/vite';
import { ConfigEnv, defineConfig } from 'vite';

export default (config: ConfigEnv) =>
    defineConfig({
        server: {
            fs: { allow: ['..'] },
            port: 3000,
            host: config.mode === 'development' ? 'localhost' : '0.0.0.0',
        },
        plugins: [sveltekit()],
    });
