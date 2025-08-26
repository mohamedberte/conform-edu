"use client";
import AuthManager from '@/components/AuthManager';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* 🔧 PERSONNALISATION: Page principale avec système d'authentification complet */}
      <AuthManager />
    </main>
  );
}