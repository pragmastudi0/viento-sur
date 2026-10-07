'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  variantId: string;
  variantLabel: string;
  quantity: number;
}

const STORAGE_KEY = 'viento-sur-cart';

type State = { items: CartItem[] };

type Action =
  | { type: 'hydrate'; items: CartItem[] }
  | { type: 'add'; item: CartItem }
  | { type: 'increment'; key: string }
  | { type: 'decrement'; key: string }
  | { type: 'remove'; key: string }
  | { type: 'clear' };

/** Identidad de una línea del carrito: producto + variante. */
const keyOf = (i: Pick<CartItem, 'productId' | 'variantId'>) =>
  `${i.productId}::${i.variantId}`;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { items: action.items };

    case 'add': {
      const key = keyOf(action.item);
      const existing = state.items.find((i) => keyOf(i) === key);
      if (existing) {
        return {
          items: state.items.map((i) =>
            keyOf(i) === key
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i,
          ),
        };
      }
      return { items: [...state.items, action.item] };
    }

    case 'increment':
      return {
        items: state.items.map((i) =>
          keyOf(i) === action.key ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      };

    case 'decrement':
      return {
        items: state.items
          .map((i) =>
            keyOf(i) === action.key ? { ...i, quantity: i.quantity - 1 } : i,
          )
          .filter((i) => i.quantity > 0),
      };

    case 'remove':
      return { items: state.items.filter((i) => keyOf(i) !== action.key) };

    case 'clear':
      return { items: [] };

    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  mounted: boolean;
  keyOf: (i: Pick<CartItem, 'productId' | 'variantId'>) => string;
  addItem: (item: CartItem) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  replaceItems: (items: CartItem[]) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hidratar desde localStorage al montar.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) dispatch({ type: 'hydrate', items: parsed });
      }
    } catch {
      /* Ignorar datos corruptos: el carrito arranca vacío. */
    }
    setMounted(true);
  }, []);

  // Persistir en cada cambio (solo después de hidratar).
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      /* Almacenamiento no disponible: se ignora. */
    }
  }, [state.items, mounted]);

  // Bloquear el scroll del body mientras el carrito está abierto.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const count = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items],
  );

  const subtotal = useMemo(
    () => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [state.items],
  );

  const value: CartContextValue = {
    items: state.items,
    count,
    subtotal,
    isOpen,
    mounted,
    keyOf,
    addItem: (item) => dispatch({ type: 'add', item }),
    increment: (key) => dispatch({ type: 'increment', key }),
    decrement: (key) => dispatch({ type: 'decrement', key }),
    removeItem: (key) => dispatch({ type: 'remove', key }),
    clearCart: () => dispatch({ type: 'clear' }),
    replaceItems: (items) => dispatch({ type: 'hydrate', items }),
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
