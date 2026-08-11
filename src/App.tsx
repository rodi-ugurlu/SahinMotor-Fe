import { ConfigProvider } from 'antd';
import trTR from 'antd/locale/tr_TR';
import { AppRouter } from './router/AppRouter';

function App() {
  return (
    <ConfigProvider locale={trTR}>
      <AppRouter />
    </ConfigProvider>
  );
}

export default App;
