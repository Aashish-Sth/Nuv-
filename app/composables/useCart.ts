import { computed, ref, watch } from "vue";

interface CartItem {
  id: string | number;
  menuItemId?: string;
  restaurantId?: string;
  name: string;
  restaurant: string;
  price: number;
  quantity: number;
  image: string;
}

const STORAGE_KEY = "nuve_cart_v1";

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

const cartItems = ref<CartItem[]>(loadFromStorage());
const lastAdded = ref<string | null>(null);

// persist
watch(
  cartItems,
  (v) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    } catch {}
  },
  { deep: true },
);

export const useCart = () => {
  const itemCount = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0),
  );
  const subtotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  const deliveryFee = 3.99;
  const total = computed(() => subtotal.value + deliveryFee);

  const updateQty = (id: string | number, delta: number) => {
    const item = cartItems.value.find((i) => i.id === id);
    if (!item) return;
    item.quantity = Math.max(0, item.quantity + delta);
    if (item.quantity === 0)
      cartItems.value = cartItems.value.filter((i) => i.id !== id);
  };

  const removeItem = (id: string | number) => {
    cartItems.value = cartItems.value.filter((i) => i.id !== id);
  };

  const addItem = (item: CartItem) => {
    const existing = cartItems.value.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cartItems.value.push(item);
    }
    lastAdded.value = item.name;
    setTimeout(() => (lastAdded.value = null), 1800);
  };

  const clearCart = () => {
    cartItems.value = [];
  };

  return {
    cartItems,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    updateQty,
    removeItem,
    addItem,
    clearCart,
    lastAdded,
  };
};
