import { useState } from 'react';
import { Alert, Button, Form, Input, Typography } from 'antd';

import type { FormInstance } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, MailOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface LoginFormProps {
  form: FormInstance;
  onFinish: (values: { email: string; password: string }) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  loginError: string | null;
  onClearError: () => void;
}

export function validateEmail(email?: string): boolean {
  if (!email) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

export function LoginForm({ form, onFinish, onForgotPassword, isLoading, loginError, onClearError }: LoginFormProps) {
  const [infoState, setInfoState] = useState<{
    type: 'success' | 'warning' | 'info' | 'error';
    message: string;
  } | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const alertState = loginError
    ? { type: 'error' as const, message: loginError }
    : infoState;

  const handleForgotPasswordClick = async () => {
    const email = form.getFieldValue('email')?.trim();

    if (!email) {
      setInfoState({
        type: 'warning',
        message: 'Geçici şifrenizi gönderebilmemiz için mail adresinizi giriniz.',
      });
      return;
    }

    if (!validateEmail(email)) {
      setInfoState({
        type: 'warning',
        message: 'Lütfen geçerli bir e-posta adresi giriniz.',
      });
      return;
    }



    setIsForgotLoading(true);
    setInfoState(null);
    try {
      await onForgotPassword(email);
      const successMsg = 'Bu maille kayıtlı bir hesabınız varsa geçici şifreniz gönderilmiştir.';
      setInfoState({
        type: 'info',
        message: successMsg,
      });
      form.setFields([
        {
          name: 'email',
          errors: [],
        },
      ]);
    } catch {
      setInfoState({
        type: 'error',
        message: 'Geçici şifre gönderilirken bir hata oluştu.',
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <Form form={form} className="animated-auth__ant-form" layout="vertical" onFinish={onFinish}>
      <Title level={2} className="animated-auth__title">
        Kullanıcı Girişi
      </Title>

      {alertState && (
        <Alert
          message={alertState.message}
          type={alertState.type}
          showIcon
          closable
          onClose={() => {
            setInfoState(null);
            onClearError();
          }}
          style={{ marginBottom: 16, borderRadius: 12 }}
        />
      )}

      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'E-posta adresinizi girin' },
          { type: 'email', message: 'Geçerli bir e-posta adresi girin' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="E-posta" size="large" />
      </Form.Item>

      <Form.Item name="password" rules={[{ required: true, message: 'Şifrenizi girin' }]}>
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Şifre"
          size="large"
          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
      </Form.Item>

      <Button
        type="link"
        danger
        className="animated-auth__forgot-link"
        onClick={handleForgotPasswordClick}
        loading={isForgotLoading}
      >
        Şifremi unuttum
      </Button>

      <Button
        type="primary"
        danger
        htmlType="submit"
        className="animated-auth__btn animated-auth__btn--solid"
        loading={isLoading}
        size="large"
        block
      >
        Giriş Yap
      </Button>
    </Form>
  );
}
