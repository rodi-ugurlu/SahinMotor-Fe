import { useRef, type Key, type ReactNode } from 'react';
import { Input } from 'antd';
import type { InputRef } from 'antd';
import { CameraOutlined, SearchOutlined } from '@ant-design/icons';
import './WorkflowProductSearch.css';

export interface WorkflowProductSearchOption {
  key: Key;
  content: ReactNode;
  onSelect: () => void;
  ariaLabel: string;
}

interface WorkflowProductSearchProps {
  value: string;
  ariaLabel: string;
  options: WorkflowProductSearchOption[];
  onChange: (value: string) => void;
  onSubmit: () => void;
  onScan?: () => void;
  autoFocus?: boolean;
  scanLabel?: string;
  emptyText?: string;
}

export function WorkflowProductSearch({
  value,
  ariaLabel,
  options,
  onChange,
  onSubmit,
  onScan,
  autoFocus = false,
  scanLabel = 'Barkod okut',
  emptyText,
}: WorkflowProductSearchProps) {
  const inputRef = useRef<InputRef>(null);

  const handleScan = () => {
    if (onScan) {
      onScan();
      return;
    }
    inputRef.current?.focus({ cursor: 'all' });
  };

  return (
    <div className="workflow-product-search">
      <div className="workflow-product-search__bar">
        <Input
          ref={inputRef}
          autoFocus={autoFocus}
          prefix={<SearchOutlined aria-hidden="true" />}
          placeholder="Ürün adı veya barkod ile arayın..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onPressEnter={onSubmit}
          allowClear
          aria-label={ariaLabel}
        />
        <button
          type="button"
          className="workflow-product-search__scan"
          onClick={handleScan}
          aria-label={scanLabel}
          title={scanLabel}
        >
          <CameraOutlined />
        </button>
      </div>

      {options.length > 0 && (
        <div className="workflow-product-search__options" role="listbox" aria-label="Ürün önerileri">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              className="workflow-product-search__option"
              onClick={option.onSelect}
              role="option"
              aria-selected="false"
              aria-label={option.ariaLabel}
            >
              {option.content}
            </button>
          ))}
        </div>
      )}

      {value.trim() && options.length === 0 && emptyText && (
        <div className="workflow-product-search__empty" role="status">{emptyText}</div>
      )}
    </div>
  );
}
