'use client';

import Auth2 from '@/components/ui/auth-02';

export default function AuthModal({ initialMode = 'login', onClose, onSuccess }) {
  return (
    <Auth2
      initialMode={initialMode}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
