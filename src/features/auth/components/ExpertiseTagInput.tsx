import { Input, Space, Tag } from 'antd';
import { FileOutlined } from '@ant-design/icons';
import type { KeyboardEvent } from 'react';

interface ExpertiseTagInputProps {
  tags: string[];
  query: string;
  suggestions: string[];
  onQueryChange: (value: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export function ExpertiseTagInput({ tags, query, suggestions, onQueryChange, onAddTag, onRemoveTag, onKeyDown }: ExpertiseTagInputProps) {
  return (
    <div className="animated-auth__tag-block">
      <div className="animated-auth__section-label">Uzmanlık Alanları (opsiyonel)</div>
      <div className="animated-auth__tag-input-wrap">
        <FileOutlined style={{ color: '#acacac' }} />
        <Space size={4} wrap style={{ flex: 1 }}>
          {tags.map((tag) => (
            <Tag key={tag} closable onClose={() => onRemoveTag(tag)} color="red">
              {tag}
            </Tag>
          ))}
          <Input
            placeholder="Etiket ekleyin (Enter veya virgül)"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </Space>
      </div>
      {suggestions.length > 0 && (
        <Space size={4} wrap style={{ marginTop: 8 }}>
          {suggestions.map((tag) => (
            <Tag key={tag} onClick={() => onAddTag(tag)} style={{ cursor: 'pointer' }}>
              {tag}
            </Tag>
          ))}
        </Space>
      )}
    </div>
  );
}
