import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/90" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">
              ASUBK Financial Management
            </h1>
            <p className="text-lg opacity-90 mb-8">
              Comprehensive credit application management system for streamlined 
              financial operations and decision-making processes.
            </p>
            <div className="space-y-4 text-sm opacity-80">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary-foreground/60" />
                <span>Multi-role access control</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary-foreground/60" />
                <span>Document management & generation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary-foreground/60" />
                <span>Commission review workflows</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary-foreground/60" />
                <span>Multilingual support (KG/RU/EN)</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full border border-primary-foreground/20" />
        <div className="absolute bottom-10 right-20 w-20 h-20 rounded-full border border-primary-foreground/30" />
        <div className="absolute top-1/2 right-5 w-16 h-16 rounded-full bg-primary-foreground/10" />
      </div>

      {/* Right side - Auth Forms */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              ASUBK Financial
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Management System
            </p>
          </div>

          {/* Auth form outlet */}
          <Outlet />
          
          {/* Footer */}
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>&copy; 2024 ASUBK Financial Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};