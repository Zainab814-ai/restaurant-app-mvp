import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrdersContext = createContext(null);
const ORDERS_STORAGE_KEY = '@restaurant_orders_v1';

function ordersReducer(state, action) {
  switch (action.type) {
    case 'SET_ORDERS':
      return action.payload;
    case 'ADD_ORDER':
      return [action.payload, ...state];
    case 'UPDATE_STATUS':
      return state.map((order) =>
        order.id === action.payload.id ? { ...order, status: action.payload.status } : order
      );
    default:
      return state;
  }
}

export function OrdersProvider({ children }) {
  const [orders, dispatch] = useReducer(ordersReducer, []);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  // Safe Load Function
  useEffect(() => {
    async function loadOrders() {
      try {
        if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
          const stored = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
          if (stored) {
            dispatch({ type: 'SET_ORDERS', payload: JSON.parse(stored) });
          }
        }
      } catch (err) {
        console.warn('AsyncStorage load skipped:', err.message);
      } finally {
        setIsOrdersLoading(false);
      }
    }
    loadOrders();
  }, []);

  // Safe Save Function
  useEffect(() => {
    if (!isOrdersLoading) {
      try {
        if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
          AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders)).catch(() => {});
        }
      } catch (err) {
        console.warn('AsyncStorage save skipped:', err.message);
      }
    }
  }, [orders, isOrdersLoading]);

  const placeOrder = (orderData) => {
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: Date.now(),
      status: 'Pending',
      ...orderData,
    };
    dispatch({ type: 'ADD_ORDER', payload: newOrder });
    return newOrder;
  };

  const updateOrderStatus = (id, status) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { id, status } });
  };

  return (
    <OrdersContext.Provider value={{ orders, placeOrder, updateOrderStatus, isOrdersLoading }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrdersContext);
}