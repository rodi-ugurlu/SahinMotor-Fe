import { useEffect, useState } from 'react';
import type { Business } from '../types/business';
import { getBusinesses } from '../services/businessService';

type State = 'loading' | 'loaded' | 'empty' | 'error';

interface UseBusinessesReturn {
  businesses: Business[];
  state: State;
  retry: () => void;
}

export function useBusinesses(): UseBusinessesReturn {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [state, setState] = useState<State>('loading');

  const fetch = () => {
    setState('loading');
    getBusinesses()
      .then((data) => {
        setBusinesses(data);
        setState(data.length === 0 ? 'empty' : 'loaded');
      })
      .catch(() => setState('error'));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, []);

  return { businesses, state, retry: fetch };
}
