import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (auth.token && !auth.user) {
      dispatch(fetchMe());
    }
  }, [dispatch, auth.token, auth.user]);

  return auth;
};

export const useCartCount = () => {
  const { items } = useSelector((state) => state.cart);
  return items.reduce((acc, item) => acc + item.quantity, 0);
};

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
