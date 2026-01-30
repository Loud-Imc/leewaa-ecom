import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistAPI } from '../api';

interface WishlistItem {
    id: string;
    productId: string;
    product: any;
}

interface WishlistState {
    items: WishlistItem[];
    loading: boolean;
    error: string | null;
}

const initialState: WishlistState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchWishlist = createAsyncThunk(
    'wishlist/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await wishlistAPI.get();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
        }
    }
);

export const addToWishlist = createAsyncThunk(
    'wishlist/add',
    async (productId: string, { rejectWithValue }) => {
        try {
            const response = await wishlistAPI.add(productId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
        }
    }
);

export const removeFromWishlist = createAsyncThunk(
    'wishlist/remove',
    async (productId: string, { rejectWithValue }) => {
        try {
            await wishlistAPI.remove(productId);
            return productId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearWishlist: (state) => {
            state.items = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Wishlist
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Add to Wishlist
            .addCase(addToWishlist.fulfilled, (state, action) => {
                const exists = state.items.find(item => item.productId === action.payload.productId);
                if (!exists) {
                    state.items.push(action.payload);
                }
            })
            // Remove from Wishlist
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.productId !== action.payload);
            });
    },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
