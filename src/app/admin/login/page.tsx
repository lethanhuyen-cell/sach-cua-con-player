'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, LockIcon } from '@/components/ui/Icons';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu quản trị.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Đăng nhập không thành công.');
        setLoading(false);
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-5 py-6 flex flex-col justify-between">
      <div>
        <Link
          href="/"
          style={{ color: 'var(--text-secondary)' }}
          className="h-10 inline-flex items-center gap-1 text-xs font-medium"
        >
          <ChevronLeftIcon size={16} />
          <span>Về Trang chủ Thư viện</span>
        </Link>
      </div>

      <div
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-hairline)'
        }}
        className="rounded-[12px] p-6 my-auto space-y-5"
      >
        <div className="space-y-1">
          <div
            style={{ color: 'var(--accent-primary)' }}
            className="inline-flex items-center gap-1.5 vn-eyebrow"
          >
            <LockIcon size={14} />
            <span>Xưởng Sách Gia Đình</span>
          </div>
          <h1 className="text-[22px] font-bold font-editorial">Đăng nhập Quản trị</h1>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Khu vực dành riêng cho Chủ thư viện để thêm bộ sách, biên tập tập truyện, tải bản thu giọng đọc và tranh minh họa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-xs font-medium mb-1.5">
              Mật khẩu Chủ thư viện
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu quản trị..."
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-hairline)'
              }}
              className="w-full h-11 px-3.5 rounded-[8px] text-sm outline-none"
            />
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-hairline)',
                color: 'var(--accent-berry)'
              }}
              className="p-3 rounded-[8px] text-xs leading-relaxed"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-primary-fg)'
            }}
            className="w-full h-11 rounded-[8px] text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Mở Xưởng Sách'}
          </button>
        </form>
      </div>

      <p className="text-center text-[11px]" style={{ color: 'var(--text-secondary)' }}>
        Người nghe gia đình vào thẳng đường dẫn chính không cần mật khẩu này.
      </p>
    </div>
  );
}
