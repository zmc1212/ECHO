import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 加载当前目录下的环境变量
  // 第三个参数传 '' 表示加载所有变量，不仅仅是 VITE_ 开头的
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // 这里的配置会将代码中出现的 process.env.API_KEY 字符串
      // 在构建时替换为实际的环境变量值
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});