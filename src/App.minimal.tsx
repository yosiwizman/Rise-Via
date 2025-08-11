import React, { useEffect, useState } from 'react';

console.log('🔵 App.minimal.tsx module loading...');
console.log('🔵 React version:', React.version);

let Navigation: any = null;
let Footer: any = null;
let AdminPage: any = null;
let AgeGate: any = null;
let useAgeGate: any = null;

try {
  console.log('🔍 Testing Navigation import...');
  const NavModule = require('./components/Navigation');
  Navigation = NavModule.Navigation;
  console.log('✅ Navigation imported successfully');
} catch (error) {
  console.error('❌ Navigation import failed:', error);
  if (error instanceof Error && error.message.includes("'S'")) {
    console.error('🔴 FOUND "S" ERROR IN NAVIGATION!', error.stack);
  }
}

try {
  console.log('🔍 Testing Footer import...');
  const FooterModule = require('./components/Footer');
  Footer = FooterModule.Footer;
  console.log('✅ Footer imported successfully');
} catch (error) {
  console.error('❌ Footer import failed:', error);
  if (error instanceof Error && error.message.includes("'S'")) {
    console.error('🔴 FOUND "S" ERROR IN FOOTER!', error.stack);
  }
}

try {
  console.log('🔍 Testing AdminPage import...');
  const AdminModule = require('./pages/AdminPage');
  AdminPage = AdminModule.AdminPage;
  console.log('✅ AdminPage imported successfully');
} catch (error) {
  console.error('❌ AdminPage import failed:', error);
  if (error instanceof Error && error.message.includes("'S'")) {
    console.error('🔴 FOUND "S" ERROR IN ADMINPAGE!', error.stack);
  }
}

try {
  console.log('🔍 Testing AgeGate imports...');
  const AgeGateModule = require('./components/AgeGate');
  const useAgeGateModule = require('./hooks/useAgeGate');
  AgeGate = AgeGateModule.AgeGate;
  useAgeGate = useAgeGateModule.useAgeGate;
  console.log('✅ AgeGate imports successful');
} catch (error) {
  console.error('❌ AgeGate imports failed:', error);
  if (error instanceof Error && error.message.includes("'S'")) {
    console.error('🔴 FOUND "S" ERROR IN AGEGATE!', error.stack);
  }
}

function App() {
  console.log('🔵 App component rendering - MINIMAL VERSION...');
  
  const [currentPage, setCurrentPage] = useState('admin');
  const [error, setError] = useState<string | null>(null);
  
  let ageGateData = { isAgeVerified: true, showAgeGate: false, verifyAge: () => {} };
  if (useAgeGate) {
    try {
      ageGateData = useAgeGate();
    } catch (error) {
      console.error('❌ useAgeGate hook failed:', error);
      if (error instanceof Error && error.message.includes("'S'")) {
        console.error('🔴 FOUND "S" ERROR IN useAgeGate HOOK!', error.stack);
      }
    }
  }
  
  useEffect(() => {
    console.log('🔵 App component mounted - MINIMAL VERSION');
    
    if ((window as any).__moduleErrors?.length > 0) {
      setError('Module initialization errors detected. Check console.');
    }
    
    const path = window.location.pathname;
    console.log('🔍 Current path:', path);
    
    if (path === '/admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('home');
    }
  }, []);

  const renderPage = () => {
    console.log('🔍 Rendering page:', currentPage);
    
    switch (currentPage) {
      case 'admin':
        if (AdminPage) {
          console.log('🔍 Rendering AdminPage...');
          return React.createElement(AdminPage, { onNavigate: () => {} });
        } else {
          return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>AdminPage Import Failed</h2>
              <p>Check console for import errors</p>
            </div>
          );
        }
      default:
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Minimal Debug App</h2>
            <p>Current page: {currentPage}</p>
            <div style={{ marginTop: '20px' }}>
              <h3>Import Status:</h3>
              <ul style={{ listStyle: 'none', textAlign: 'left', display: 'inline-block' }}>
                <li>Navigation: {Navigation ? '✅' : '❌'}</li>
                <li>Footer: {Footer ? '✅' : '❌'}</li>
                <li>AdminPage: {AdminPage ? '✅' : '❌'}</li>
                <li>AgeGate: {AgeGate ? '✅' : '❌'}</li>
                <li>useAgeGate: {useAgeGate ? '✅' : '❌'}</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>App Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
        <details>
          <summary>Module Errors</summary>
          <pre>{JSON.stringify((window as any).__moduleErrors || [], null, 2)}</pre>
        </details>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {ageGateData.showAgeGate && AgeGate && (
        React.createElement(AgeGate, { onVerify: ageGateData.verifyAge })
      )}
      
      {!ageGateData.showAgeGate && (
        <>
          {Navigation && React.createElement(Navigation, { onNavigate: () => {} })}
          <main>
            {renderPage()}
          </main>
          {Footer && React.createElement(Footer)}
        </>
      )}
    </div>
  );
}

export default App;
