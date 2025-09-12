import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

export const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new user list page
    navigate(`${ROUTES.ADMIN}/users`, { replace: true });
  }, [navigate]);

  return null;
};
