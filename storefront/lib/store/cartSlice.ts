import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    discount: number;
    quantity: number;
    image: string;
    stock: number;
}

interface CartState {
    items: CartItem[];
    total: number;
}

const initialState: CartState = {
    items: [],
    total: 0,
};

const calculateTotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => {
        const price = item.price * (1 - item.discount / 100);
        return sum + price * item.quantity;
    }, 0);
};

const syncToLocalStorage = (state: CartState) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('guestCart', JSON.stringify(state.items));
    }
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.items.find(
                (item) => item.productId === action.payload.productId
            );

            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }

            state.total = calculateTotal(state.items);
            syncToLocalStorage(state);
        },
        updateQuantity: (
            state,
            action: PayloadAction<{ productId: string; quantity: number }>
        ) => {
            const item = state.items.find((i) => i.productId === action.payload.productId);
            if (item) {
                item.quantity = action.payload.quantity;
                state.total = calculateTotal(state.items);
                syncToLocalStorage(state);
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.productId !== action.payload);
            state.total = calculateTotal(state.items);
            syncToLocalStorage(state);
        },
        clearCart: (state) => {
            state.items = [];
            state.total = 0;
            syncToLocalStorage(state);
        },
        setCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
            state.total = calculateTotal(action.payload);
            syncToLocalStorage(state);
        },
    },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, setCart } =
    cartSlice.actions;
export default cartSlice.reducer;
