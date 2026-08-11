import { useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Descriptions,
  Drawer,
  Input,
  Select,
  Skeleton,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useLogs } from '../hooks/useLogs';
import type { LogEntry, LogType } from '../types/logs';
import './LogsPage.css';

const { Text } = Typography;

const typeMap: Record<LogType, { color: string; label: string }> = {
  sales: { color: 'blue', label: 'Satış' },
  stock: { color: 'orange', label: 'Stok' },
  login: { color: 'green', label: 'Giriş' },
  logout: { color: 'red', label: 'Çıkış' },
};

export default function LogsPage() {
  const {
    filteredLogs, state, userFilter, typeFilter, search, userActivity,
    setUserFilter, setTypeFilter, setSearch, retry,
  } = useLogs();

  const [detailLog, setDetailLog] = useState<LogEntry | null>(null);

  const columns = [
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      width: 160,
      sorter: (a: LogEntry, b: LogEntry) => a.date.localeCompare(b.date),
      defaultSortOrder: 'descend' as const,
      render: (date: string) => <Text className="logs-page__log-date">{date}</Text>,
    },
    {
      title: 'Kullanıcı',
      key: 'user',
      width: 170,
      render: (_: unknown, record: LogEntry) => (
        <div className="logs-page__log-user">
          <Avatar size={32} style={{ backgroundColor: record.user.color, flexShrink: 0 }}>
            {record.user.name.charAt(0)}
          </Avatar>
          <div className="logs-page__log-user-info">
            <Text className="logs-page__log-user-name">{record.user.name}</Text>
            <Tag color={record.user.role === 'SuperAdmin' ? 'red' : record.user.role === 'Admin' ? 'blue' : record.user.role === 'Personel' ? 'green' : 'default'} style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>
              {record.user.role}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'İşlem Tipi',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (type: LogType) => {
        const t = typeMap[type];
        return <Tag color={t.color}>{t.label}</Tag>;
      },
    },
    {
      title: 'Modül',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (mod: string) => <Tag>{mod}</Tag>,
    },
    {
      title: 'Açıklama',
      key: 'description',
      render: (_: unknown, record: LogEntry) => (
        <div className="logs-page__log-desc">
          <Text className="logs-page__log-desc-main">{record.description}</Text>
          {record.detail && <Text className="logs-page__log-desc-detail">{record.detail}</Text>}
        </div>
      ),
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
      responsive: ['lg' as const],
      render: (ip: string) => <Text className="logs-page__log-ip">{ip}</Text>,
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: unknown, record: LogEntry) => (
        <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => setDetailLog(record)} />
      ),
    },
  ];

  return (
    <div className="logs-page">
      <div className="logs-page__top-bar">
        <div className="logs-page__title-row">
          <h1 className="logs-page__title">Loglama</h1>
          {state === 'loaded' && <Badge count={filteredLogs.length} color="#E32727" />}
        </div>
        <div className="logs-page__actions">
          <Button icon={<DownloadOutlined />} onClick={() => { message.info('Dışa aktarma özelliği henüz eklenmedi'); }}>
            Dışa Aktar
          </Button>
        </div>
      </div>

      {state === 'error' && (
        <Alert
          message="Log verileri yüklenirken hata oluştu"
          type="error" showIcon
          action={<Button size="small" danger icon={<ReloadOutlined />} onClick={retry}>Yeniden Dene</Button>}
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      {state === 'loading' ? (
        <div className="logs-page__user-cards">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="logs-page__user-card">
              <Skeleton.Avatar active size={40} shape="circle" />
              <div style={{ flex: 1 }}>
                <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="logs-page__user-cards">
          {userActivity.map(({ user, count }) => (
            <div
              key={user.id}
              className={`logs-page__user-card ${userFilter === user.id ? 'logs-page__user-card--active' : ''}`}
              onClick={() => setUserFilter(userFilter === user.id ? 'all' : user.id)}
            >
              <Avatar size={40} style={{ backgroundColor: user.color, flexShrink: 0 }}>
                {user.name.charAt(0)}
              </Avatar>
              <div className="logs-page__user-card-info">
                <div className="logs-page__user-card-name">{user.name}</div>
                <div className="logs-page__user-card-role">{user.role}</div>
              </div>
              <div className="logs-page__user-card-count" style={{ color: user.color }}>
                {count}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="logs-page__filter-row">
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: 160 }}
          size="large"
          options={[
            { value: 'all', label: 'Tüm İşlemler' },
            { value: 'sales', label: 'Satış' },
            { value: 'stock', label: 'Stok' },
          ]}

        />
        <Input
          prefix={<SearchOutlined />}
          placeholder="Açıklamada ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
          size="large"
          allowClear
        />
      </div>

      {state === 'loading' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      )}

      {state === 'empty' && (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12 }}>
          <Text type="secondary" style={{ fontSize: 16 }}>Henüz log kaydı bulunmuyor</Text>
        </div>
      )}

      {state === 'loaded' && (
        <Table<LogEntry>
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (_t, range) => `Bu sayfada ${range[0]}-${range[1]} gösteriliyor` }}
          style={{ background: '#fff', borderRadius: 12 }}
          scroll={{ x: 1000 }}
          locale={{ emptyText: 'Filtrelere uygun log bulunamadı' }}
        />
      )}

      <Drawer
        title={detailLog ? `İşlem Detayı — ${detailLog.id}` : ''}
        open={!!detailLog}
        onClose={() => setDetailLog(null)}
        width={500}
      >
        {detailLog && (
          <>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Kullanıcı">
                <div className="logs-page__log-user">
                  <Avatar size={28} style={{ backgroundColor: detailLog.user.color }}>
                    {detailLog.user.name.charAt(0)}
                  </Avatar>
                  <Text strong>{detailLog.user.name}</Text>
                  <Tag color={detailLog.user.role === 'SuperAdmin' ? 'red' : detailLog.user.role === 'Admin' ? 'blue' : detailLog.user.role === 'Personel' ? 'green' : 'default'}>
                    {detailLog.user.role}
                  </Tag>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="İşlem Tipi">
                <Tag color={typeMap[detailLog.type].color}>{typeMap[detailLog.type].label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Modül">
                <Tag>{detailLog.module}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tarih">{detailLog.date}</Descriptions.Item>
              <Descriptions.Item label="IP Adresi">
                <Text code>{detailLog.ip}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Açıklama">{detailLog.description}</Descriptions.Item>
              {detailLog.detail && (
                <Descriptions.Item label="Detay">{detailLog.detail}</Descriptions.Item>
              )}
            </Descriptions>

            {detailLog.changes && detailLog.changes.length > 0 && (
              <>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Değişiklik Detayı</Text>
                <Table
                  columns={[
                    { title: 'Alan', dataIndex: 'field', key: 'field' },
                    {
                      title: 'Önceki Değer',
                      dataIndex: 'oldValue',
                      key: 'oldValue',
                      render: (v: string) => <Text delete style={{ color: '#E32727' }}>{v}</Text>,
                    },
                    {
                      title: 'Yeni Değer',
                      dataIndex: 'newValue',
                      key: 'newValue',
                      render: (v: string) => <Text strong style={{ color: '#22C55E' }}>{v}</Text>,
                    },
                  ]}
                  dataSource={detailLog.changes}
                  rowKey="field"
                  pagination={false}
                  size="small"
                  className="logs-page__changes-table"
                />
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
