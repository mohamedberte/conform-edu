'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Shield, 
  HelpCircle,
  Bell,
  Moon,
  Sun
} from 'lucide-react';

interface ProfileMenuProps {
  user: any;
  userProfile?: any;
  expertProfile?: any;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  className?: string;
}

export default function ProfileMenu({ 
  user, 
  userProfile,
  expertProfile, 
  onProfileClick, 
  onSettingsClick, 
  onLogout,
  className = ""
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  const getAccountStatus = () => {
    if (expertProfile?.is_verified) return 'Compte Vérifié';
    if (expertProfile?.verification_status === 'pending') return 'Vérification en cours';
    if (expertProfile?.verification_status === 'rejected') return 'Vérification refusée';
    return 'Non vérifié';
  };

  const getStatusColor = () => {
    if (expertProfile?.is_verified) return 'text-green-600';
    if (expertProfile?.verification_status === 'pending') return 'text-yellow-600';
    if (expertProfile?.verification_status === 'rejected') return 'text-red-600';
    return 'text-gray-500';
  };

  const handleMenuAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
      >
        {/* Avatar avec statut en ligne */}
        <div className="relative">
          <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
            {getInitials(userProfile?.first_name || user.user_metadata?.first_name, userProfile?.last_name || user.user_metadata?.last_name)}
          </div>
          {/* Indicateur de statut en ligne */}
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
        </div>
        
        {/* Informations utilisateur - cachées sur mobile */}
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
            {userProfile?.first_name || user.user_metadata?.first_name} {userProfile?.last_name || user.user_metadata?.last_name}
          </div>
          <div className={`text-xs font-medium ${getStatusColor()}`}>
            {getAccountStatus()}
          </div>
        </div>
        
        {/* Icône de flèche avec animation */}
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-all duration-200 ${isOpen ? 'rotate-180' : ''} group-hover:text-gray-600`} />
      </button>

      {/* Menu déroulant avec animation */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
          {/* En-tête du menu avec informations complètes */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {getInitials(userProfile?.first_name || user.user_metadata?.first_name, userProfile?.last_name || user.user_metadata?.last_name)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {userProfile?.first_name || user.user_metadata?.first_name} {userProfile?.last_name || user.user_metadata?.last_name}
                </div>
                <div className="text-xs text-gray-500 truncate">{userProfile?.email || user.email}</div>
                <div className={`text-xs font-medium ${getStatusColor()}`}>
                  {getAccountStatus()}
                </div>
              </div>
            </div>
          </div>

          {/* Options du menu */}
          <div className="py-2">
            <button
              onClick={() => handleMenuAction(() => onProfileClick?.())}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
            >
              <User className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600" />
              <span>Mon Profil</span>
            </button>
            
            <button
              onClick={() => handleMenuAction(() => onSettingsClick?.())}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
            >
              <Settings className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600" />
              <span>Paramètres</span>
            </button>
            
            <button
              onClick={() => handleMenuAction(() => {})}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
            >
              <Bell className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600" />
              <span>Notifications</span>
              <span className="ml-auto bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
            </button>
            
            <button
              onClick={() => handleMenuAction(() => {})}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
            >
              <Shield className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600" />
              <span>Sécurité</span>
            </button>

            {/* Basculer le mode sombre */}
            <button
              onClick={() => handleMenuAction(() => setIsDarkMode(!isDarkMode))}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600" />
              ) : (
                <Moon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600" />
              )}
              <span>{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
            </button>
            
            <button
              onClick={() => handleMenuAction(() => {})}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
            >
              <HelpCircle className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600" />
              <span>Aide & Support</span>
            </button>
            
            <div className="border-t border-gray-100 my-2"></div>
            
            <button
              onClick={() => handleMenuAction(() => onLogout?.())}
              className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors group"
            >
              <LogOut className="h-4 w-4 mr-3 group-hover:text-red-700" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
