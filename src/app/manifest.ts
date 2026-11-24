import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Thư viện Đồi Mơ — Sách đọc và nghe trước giờ ngủ',
    short_name: 'Đồi Mơ',
    description: 'Sách đọc và nghe trước giờ ngủ · Copyright © Nancy & Liti',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F5EE',
    theme_color: '#F8F5EE',
    icons: [
      {
        src: '/images/books/lim-vacci-cover.jpg',
        sizes: '512x512',
        type: 'image/jpeg'
      }
    ]
  };
}
