import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthLayout } from './components/AuthLayout';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  // 🔹 одразу відкривається сторінка реєстрації
  const [isRegistering, setIsRegistering] = useState(true);

  // 🔹 якщо користувач залогінений — одразу показуємо Dashboard
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
      isLogin={!isRegistering}                    // Ось це важливо!
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
