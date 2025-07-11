import React, { useRef } from 'react';
import '../styles/AppealResult.css';

const AppealResult = ({ result, onReset }) => {
  const appealTextRef = useRef(null);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>医保索赔上诉信</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; }
            h1 { font-size: 18px; text-align: center; }
            pre { white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px; }
          </style>
        </head>
        <body>
          <pre>${result.appeal_letter}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleCopy = () => {
    if (appealTextRef.current) {
      navigator.clipboard.writeText(result.appeal_letter)
        .then(() => alert('上诉信已复制到剪贴板'))
        .catch(err => console.error('复制失败:', err));
    }
  };

  const getProbabilityColor = (probability) => {
    if (probability === '高') return 'high-probability';
    if (probability === '中等') return 'medium-probability';
    return 'low-probability';
  };

  if (!result) return null;

  return (
    <div className="appeal-result-container">
      <div className="result-header">
        <h2>生成的上诉信</h2>
        <div className="action-buttons">
          <button onClick={handleCopy} className="copy-button">复制文本</button>
          <button onClick={handlePrint} className="print-button">打印</button>
          <button onClick={onReset} className="new-button">新建上诉</button>
        </div>
      </div>

      <div className="appeal-content">
        <div className="appeal-letter">
          <h3>上诉信内容</h3>
          <pre ref={appealTextRef}>{result.appeal_letter}</pre>
        </div>

        <div className="appeal-info">
          <div className="success-probability">
            <h3>成功概率评估</h3>
            <div className={`probability-badge ${getProbabilityColor(result.success_probability)}`}>
              {result.success_probability}
            </div>
          </div>

          <div className="strategies">
            <h3>策略建议</h3>
            <ul>
              {result.strategies.map((strategy, index) => (
                <li key={index}>{strategy}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppealResult;