import { Button, Form, Input, Typography } from 'antd';
import type { FormInstance } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, MailOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface LoginFormProps {
  form: FormInstance;
  onFinish: (values: { email: string; password: string }) => Promise<void>;
  onForgotPassword: () => void;
  isLoading: boolean;
}

export function LoginForm({ form, onFinish, onForgotPassword, isLoading }: LoginFormProps) {

  return (
    <Form form={form} className="animated-auth__ant-form" layout="vertical" onFinish={onFinish}>
      <Title level={2} className="animated-auth__title">
        Kullanıcı Girişi
      </Title>

      <Form.Item name="email" rules={[{ required: true, message: 'E-posta adresinizi girin' }]}>
        <Input prefix={<MailOutlined />} type="email" placeholder="E-posta" size="large" />
      </Form.Item>

      <Form.Item name="password" rules={[{ required: true, message: 'Şifrenizi girin' }]}>
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Şifre"
          size="large"
          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
      </Form.Item>

      <Button type="link" danger className="animated-auth__forgot-link" onClick={onForgotPassword}>
        Şifremi unuttum
      </Button>

      <Button type="primary" danger htmlType="submit" className="animated-auth__btn animated-auth__btn--solid" loading={isLoading} size="large" block>
        Giriş Yap
      </Button>
    </Form>
  );
}
