export default function manifest() {
  return {
    name: '부산 203 가이드',
    short_name: '203 가이드',
    description: '부산 203번 버스 실시간 운행 현황 및 가이드',
    start_url: '/',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#10b981',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}