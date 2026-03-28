import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// 捕获 React 渲染错误
try {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <App />
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.getElementById("root").innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; background-color: #f5f5f5;">
      <h1 style="font-size: 24px; color: #333; margin-bottom: 16px;">应用启动失败</h1>
      <p style="font-size: 14px; color: #666; margin-bottom: 24px;">${error.message || '未知错误'}</p>
      <button onclick="window.location.reload()" style="padding: 10px 24px; background-color: #409EFF; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">刷新页面</button>
    </div>
  `;
}
