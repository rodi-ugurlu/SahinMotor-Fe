import { Form } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { BannerPanel } from '../components/BannerPanel';
import { LoginForm } from '../components/LoginForm';
import registerImage from '../assets/register.svg';
import './AnimatedAuthPage.css';

const platformSlogans = [
  'SIFIR MOTOR SATIŞI, BAKIM VE ONARIM',
  'KASK, MONT VE KORUMA EKİPMANLARI',
  'TÜM MOTOR İHTİYAÇLARINIZ TEK PLATFORMDA',
];

export default function AnimatedAuthPage() {
  const { isLoading, login, resetPassword } = useAuth();
  const [form] = Form.useForm();

  const handleForgotPassword = async () => {
    const email = form.getFieldValue('email');
    if (!email || !validateEmail(email)) return;
    await resetPassword(email);
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    await login('sahin', values);
  };

  return (
    <div className="animated-auth animated-auth--customer animated-auth--login">
      <div className="animated-auth__forms-container">
        <div className="animated-auth__form-stage">
          <div className="animated-auth__form">
            <LoginForm
              form={form}
              onFinish={handleLogin}
              onForgotPassword={handleForgotPassword}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="animated-auth__panels-container">
        <BannerPanel
          audience=""
          slogans={platformSlogans}
          imageSrc={registerImage}
          imageAlt="Şahin Motor & Koman Motor"
          side="left"
        />
        <div className="animated-auth__panel animated-auth__panel--right" />
      </div>
    </div>
  );
}

function validateEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}
