import { useState } from 'react';

const TestLogin = () => {
  const [email, setEmail] = useState('campo@alfalfa.com');
  const [password, setPassword] = useState('Campo2025!');
  const [resultado, setResultado] = useState('');

  const handleLogin = async () => {
    setResultado('⏳ Conectando...');
    try {
      const res = await fetch('http://localhost:3000/api/internal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setResultado('✅ Login OK! Token: ' + data.token.substring(0, 30) + '...');
      } else {
        setResultado('❌ Error: ' + data.error);
      }
    } catch (err) {
      setResultado('❌ No se pudo conectar: ' + (err as Error).message);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Login AlfalfaTrace</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      <button
        onClick={handleLogin}
        className="w-full bg-green-600 text-white p-2 rounded"
      >
        Probar Login
      </button>
      <p className="mt-4 text-sm">{resultado}</p>
    </div>
  );
};

export default TestLogin;