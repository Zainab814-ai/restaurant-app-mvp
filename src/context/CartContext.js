import React, { createContext, useContext, useReducer } from 'react';
import { cartReducer, initialCartState } from '../reducers/cartReducer';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState || { items: [] });

  return (
    <CartContext.Provider value={{ state: state || { items: [] }, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    return { state: { items: [] }, dispatch: () => {} };
  }
  return context;
}