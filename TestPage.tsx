// src/pages/TestPage.tsx
import { useEffect } from 'react';

const TestPage = () => {
  useEffect(() => {
    console.log('🔥🔥🔥 TEST PAGE CARGADA 🔥🔥🔥');
    alert('La página de test está funcionando');
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-600">TEST PAGE</h1>
      <p>Si ves esto, la página se renderiza correctamente.</p>
    </div>
  );
};

export default TestPage;