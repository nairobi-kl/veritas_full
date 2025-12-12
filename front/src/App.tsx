import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthLayout } from './components/AuthLayout';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  const [isRegistering, setIsRegistering] = useState(true);

  useEffect(() => {
    if (user?.isAuthenticated) {
      setIsRegistering(false);
    }
  }, [user]);

  if (user?.isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <AuthLayout
      title={isRegistering ? 'Реєстрація' : 'Вхід'}
      subtitle={isRegistering ? 'Створіть новий акаунт' : 'Увійдіть в систему'}
      isLogin={!isRegistering}                 
      onToggle={() => setIsRegistering(!isRegistering)}
    >
      {isRegistering ? (
        <RegisterForm onSwitchToLogin={() => setIsRegistering(false)} />
      ) : (
        <LoginForm onSwitchToRegister={() => setIsRegistering(true)} />
      )}
    </AuthLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
