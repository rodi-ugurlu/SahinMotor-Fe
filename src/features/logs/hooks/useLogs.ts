import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import type { LogEntry, LogUser } from '../types/logs';
import { USERS } from '../types/logs';
import { exportLogs, getLogs } from '../services/logsService';

type State = 'loading' | 'loaded' | 'empty' | 'error';

interface UseLogsReturn {
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  state: State;
  userFilter: string;
  typeFilter: string;
  search: string;
  userActivity: Array<{ user: LogUser; count: number }>;
  setUserFilter: (v: string) => void;
  setTypeFilter: (v: string) => void;
  setSearch: (v: string) => void;
  handleExport: () => Promise<void>;
  retry: () => void;
}

export function useLogs(): UseLogsReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [state, setState] = useState<State>('loading');
  const [userFilter, setUserFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetch = useCallback(() => {
    setState('loading');
    getLogs()
      .then((data) => {
        setLogs(data);
        setState(data.length === 0 ? 'empty' : 'loaded');
      })
      .catch(() => setState('error'));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, [fetch]);

  const filteredLogs = useMemo(() => {
    let result = logs.filter((l) => l.type !== 'login' && l.type !== 'logout');

    if (userFilter !== 'all') {

      result = result.filter((l) => l.user.id === userFilter);
    }

    if (typeFilter !== 'all') {
      result = result.filter((l) => l.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.description.toLowerCase().includes(q) ||
          (l.detail && l.detail.toLowerCase().includes(q))
      );
    }

    return result;
  }, [logs, userFilter, typeFilter, search]);

  const userActivity = useMemo(() => {
    return USERS.map((user) => ({
      user,
      count: logs.filter((l) => l.user.id === user.id).length,
    }));
  }, [logs]);

  const handleExport = async () => {
    await exportLogs();
    message.success('Loglar dışa aktarıldı');
  };

  return {
    logs, filteredLogs, state, userFilter, typeFilter, search, userActivity,
    setUserFilter, setTypeFilter, setSearch, handleExport, retry: fetch,
  };
}
