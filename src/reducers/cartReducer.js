export const initialCartState = {
  items: [],
  promoCode: '',
  discountPercent: 0,
};

export const PROMO_CODES = {
  WELCOME10: 10,
  FEAST20: 20,
};

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1,
        };
        return { ...state, items: updatedItems };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1, note: '' }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case 'INCREMENT':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };

    case 'DECREMENT':
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0),
      };

    case 'UPDATE_NOTE':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, note: action.payload.note }
            : item
        ),
      };

    case 'APPLY_PROMO': {
      const code = action.payload.toUpperCase();
      if (PROMO_CODES[code]) {
        return {
          ...state,
          promoCode: code,
          discountPercent: PROMO_CODES[code],
        };
      }
      throw new Error('Invalid Promo Code');
    }

    case 'REMOVE_PROMO':
      return {
        ...state,
        promoCode: '',
        discountPercent: 0,
      };

    case 'CLEAR_CART':
      return initialCartState;

    default:
      return state;
  }
}