'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ResetPasswordArea from '@/components/ResetPasswordArea';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const extractTokens = () => {
      let token = null;
      let refresh = null;
      let type = null;

      // 1. Essayer d'abord les paramètres de requête
      token = searchParams.get('access_token');
      refresh = searchParams.get('refresh_token');
      type = searchParams.get('type');

      // 2. Si pas trouvé, essayer le fragment de l'URL (#)
      if (!token && typeof window !== 'undefined') {
        const hash = window.location.hash.substring(1); // Enlever le #
        const hashParams = new URLSearchParams(hash);
        token = hashParams.get('access_token');
        refresh = hashParams.get('refresh_token');
        type = hashParams.get('type');
      }

      console.log('Reset password tokens:', { token: !!token, refresh: !!refresh, type });

      // Vérifier que c'est bien une réinitialisation de mot de passe
      if (token && type === 'recovery') {
        setAccessToken(token);
        setRefreshToken(refresh);
      } else {
        console.error('Invalid reset password link. Missing token or wrong type.', { type, hasToken: !!token });
      }
      
      setIsValidating(false);
    };

    extractTokens();
  }, [searchParams]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validation du lien en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ResetPasswordArea 
          accessToken={accessToken || undefined} 
          refreshToken={refreshToken || undefined}
        />
      </div>
    </div>
  );
}
