import { Button, Checkbox, Form, Input, Radio, Select, Typography } from 'antd';
import type { FormInstance } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, MailOutlined, PhoneOutlined, UserOutlined, BuildOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { AuthView } from '../types/auth';
import { cities, districtsForCity, firstDistrictForCity } from '../lib/locations';
import { formatPhoneNumber, validatePasswordRule } from '../../../shared/validation';

const { Title } = Typography;

interface KomanRegisterFormProps {
  form: FormInstance;
  activeView: AuthView;
  onViewChange: (view: AuthView) => void;
  onFinish: (values: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
  onOpenKvkk: () => void;
  watchedCity: string | undefined;
}

export function KomanRegisterForm({ form, activeView, onViewChange, onFinish, isLoading, onOpenKvkk, watchedCity }: KomanRegisterFormProps) {
  const navigate = useNavigate();
  const districts = districtsForCity(watchedCity);

  return (
    <Form form={form} className="animated-auth__ant-form" layout="vertical" onFinish={onFinish}>
      <Radio.Group
        value={activeView}
        onChange={(e) => onViewChange(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        size="large"
        className="animated-auth__method-toggle-ant"
      >
        <Radio.Button value="login">Giriş Yap</Radio.Button>
        <Radio.Button value="register">Kayıt Ol</Radio.Button>
      </Radio.Group>

      <Title level={2} className="animated-auth__title">Koman Motor Bayi Başvurusu</Title>

      <div className="animated-auth__register-scroll">
        <Form.Item name="companyName" rules={[{ required: true, message: 'Firma adını girin' }]}>
          <Input prefix={<BuildOutlined />} placeholder="Firma Adı" size="large" />
        </Form.Item>

        <Form.Item name="contactName" rules={[{ required: true, message: 'Yetkili adını girin' }]}>
          <Input prefix={<UserOutlined />} placeholder="Yetkili Ad Soyad" size="large" />
        </Form.Item>

        <div className="animated-auth__form-grid">
          <Form.Item name="email" rules={[{ required: true, message: 'E-posta girin' }, { type: 'email', message: 'Geçerli bir e-posta girin' }]}>
            <Input prefix={<MailOutlined />} placeholder="E-posta" size="large" type="email" />
          </Form.Item>
          <Form.Item name="phone" rules={[{ required: true, message: 'Telefon girin' }]}>
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Telefon"
              size="large"
              onChange={(e) => form.setFieldsValue({ phone: formatPhoneNumber(e.target.value) })}
            />
          </Form.Item>
        </div>

        <div className="animated-auth__form-grid">
          <Form.Item name="city" rules={[{ required: true, message: 'İl seçin' }]}>
            <Select
              placeholder="İl"
              size="large"
              options={cities.map((c) => ({ value: c, label: c }))}
              onChange={(city) => form.setFieldsValue({ district: firstDistrictForCity(city) })}
            />
          </Form.Item>
          <Form.Item name="district" rules={[{ required: true, message: 'İlçe seçin' }]}>
            <Select placeholder="İlçe" size="large" options={districts.map((d) => ({ value: d, label: d }))} />
          </Form.Item>
        </div>

        <div className="animated-auth__form-grid">
          <Form.Item name="password" rules={[{ required: true, message: 'Şifre girin' }, { validator: validatePasswordRule }]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Şifre"
              size="large"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Şifreyi tekrar girin' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Şifreler eşleşmiyor'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Şifre Tekrar"
              size="large"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
        </div>
      </div>

      <Form.Item
        name="terms"
        valuePropName="checked"
        rules={[{ validator: (_, value) => (value ? Promise.resolve() : Promise.reject(new Error('Bayi sözleşmesini kabul etmelisiniz'))) }]}
      >
        <Checkbox>
          <Button type="link" danger className="animated-auth__link-btn" onClick={(e) => { e.stopPropagation(); onOpenKvkk(); }}>
            Bayi Sözleşmesi ve KVKK Metni
          </Button>
          'ni okudum ve kabul ediyorum.
        </Checkbox>
      </Form.Item>

      <Button type="primary" danger htmlType="submit" className="animated-auth__btn animated-auth__btn--solid" loading={isLoading} size="large" block>
        Başvuruyu Gönder
      </Button>

      <Button type="link" className="animated-auth__form-switch" onClick={() => navigate('/koman/login')}>
        Zaten bayi hesabınız var mı? Giriş yapın
      </Button>
    </Form>
  );
}
