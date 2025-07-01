import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2196f3' }}>TOKUTEI Learning</h1>
      <h2>特定技能試験学習支援アプリ</h2>
      <p>React + Vite アプリケーションが正常に動作しています！</p>
      
      <div style={{ margin: '20px 0' }}>
        <button style={{ 
          backgroundColor: '#2196f3', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          学習を開始
        </button>
      </div>
      
      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
        <h3>開発環境情報</h3>
        <ul>
          <li>React 19.1</li>
          <li>Vite 7.0</li>
          <li>TypeScript</li>
          <li>Material-UI</li>
        </ul>
      </div>
    </div>
  );
}

export default App;