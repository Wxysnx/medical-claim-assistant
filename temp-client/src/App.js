import React, { useState } from 'react';
import ClaimForm from './components/ClaimForm';
import AppealResult from './components/AppealResult';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/generate-appeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
      // 滚动到结果部分
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    } catch (err) {
      console.error('生成上诉信时出错:', err);
      setError('生成上诉信时出错: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    // 滚动回页面顶部
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>医保索赔上诉助手</h1>
        <p>帮助医疗机构快速生成专业的医保索赔上诉信</p>
      </header>

      <main className="app-main">
        <ClaimForm onSubmit={handleSubmit} isLoading={isLoading} />
        
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>正在生成上诉信，请稍候...</p>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <p>{error}</p>
          </div>
        )}
        
        {result && <AppealResult result={result} onReset={handleReset} />}
      </main>

      <footer className="app-footer">
        <p>© 2025 医保索赔上诉助手 | 为橙县地区小型诊所设计</p>
      </footer>
    </div>
  );
}

export default App;