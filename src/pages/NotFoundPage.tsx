import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F8FAFC' }}>
      <Result
        status="404"
        title="Sayfa Bulunamadı"
        subTitle="Aradığınız sayfa mevcut değil veya kaldırılmış olabilir."
        extra={
          <Button type="primary" danger onClick={() => navigate('/')}>
            Ana Sayfaya Dön
          </Button>
        }
      />
    </div>
  );
}
