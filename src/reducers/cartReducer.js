export const initialCartState = {
  items: [],
  promoCode: '',
  discountPercent: 0,
};

export const PROMO_CODES = {
  WELCOME10: 10,
  FEAST20: 20,
};

// Helper function to safely compare item IDs (_id or id)
const getItemId = (item) => (item ? item._id || item.id : null);

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const payloadId = getItemId(action.payload);

      const existingIndex = state.items.findIndex(
        (item) => getItemId(item) === payloadId
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

    case 'REMOVE_ITEM': {
      const targetId = typeof action.payload === 'object' ? getItemId(action.payload) : action.payload;
      return {
        ...state,
        items: state.items.filter((item) => getItemId(item) !== targetId),
      };
    }

    case 'INCREMENT': {
      const targetId = typeof action.payload === 'object' ? getItemId(action.payload) : action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          getItemId(item) === targetId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    }

    case 'DECREMENT': {
      const targetId = typeof action.payload === 'object' ? getItemId(action.payload) : action.payload;
      return {
        ...state,
        items: state.items
          .map((item) =>
            getItemId(item) === targetId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0),
      };
    }

    case 'UPDATE_NOTE': {
      const payloadId = getItemId(action.payload);
      return {
        ...state,
        items: state.items.map((item) =>
          getItemId(item) === payloadId
            ? { ...item, note: action.payload.note }
            : item
        ),
      };
    }

    case 'APPLY_PROMO': {
      const code = action.payload ? action.payload.toUpperCase() : '';
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