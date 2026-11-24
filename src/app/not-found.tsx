import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] px-5 flex flex-col items-center justify-center text-center space-y-4">
      <span className="vn-eyebrow" style={{ color: 'var(--accent-warm)' }}>
        Trang không tồn tại
      </span>
      <h1 className="text-[22px] font-bold font-editorial">
        Không tìm thấy tập truyện hoặc bộ sách này
      </h1>
      <p
        className="text-sm max-w-[300px] leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        Có thể đường dẫn đã thay đổi hoặc tập truyện đang được tạm cất để biên tập lại.
      </p>
      <div className="flex items-center gap-2.5 pt-1">
        <Link
          href="/"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--accent-primary-fg)'
          }}
          className="h-10 px-4 rounded-[8px] text-xs font-semibold inline-flex items-center"
        >
          Về Trang chủ
        </Link>
        <Link
          href="/books"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-hairline)'
          }}
          className="h-10 px-4 rounded-[8px] text-xs font-medium inline-flex items-center"
        >
          Mở Tủ sách
        </Link>
      </div>
    </div>
  );
}
