import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  onLogout: () => void;
}

//test

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          </div>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  );
};
