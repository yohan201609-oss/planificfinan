import React from 'react';

const App = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#2563eb' }}>🏦 Finanzas Personales - React</h1>
      <p>¡La aplicación está funcionando correctamente!</p>
      <div style={{
        background: '#f0f9ff',
        padding: '20px',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h2>✅ Estado: Funcionando</h2>
        <ul>
          <li>✅ React cargado correctamente</li>
          <li>✅ Vite servidor funcionando</li>
          <li>✅ Componentes básicos operativos</li>
        </ul>
      </div>
      <button 
        style={{
          background: '#2563eb',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        onClick={() => alert('¡React está funcionando!')}
      >
        Probar Funcionalidad
      </button>
    </div>
  );
};

export default App;



