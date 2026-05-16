import { useState } from 'react';
import { TaxProvider } from './context/TaxContext';
import LandingPage from './LandingPage';
import Wizard from './components/Wizard';
import Results from './components/Results';

type Page = 'landing' | 'wizard' | 'results';

function App() {
  const [page, setPage] = useState<Page>('landing');

  return (
    <TaxProvider>
      {page === 'landing' && (
        <LandingPage onStart={() => setPage('wizard')} />
      )}
      {page === 'wizard' && (
        <Wizard
          onBack={() => setPage('landing')}
          onResults={() => setPage('results')}
        />
      )}
      {page === 'results' && (
        <Results onStartOver={() => setPage('landing')} />
      )}
      <footer style={{ textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem', color: '#6B7280', marginTop: 'auto' }}>
        Copyright 2026 Lekha Arjun K.
      </footer>
    </TaxProvider>
  );
}

export default App;
