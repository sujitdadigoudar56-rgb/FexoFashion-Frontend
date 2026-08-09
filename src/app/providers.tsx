'use client';

// Composes the Cart/Wishlist/Auth/Message contexts for the whole app.
// Order matters: MessageProvider is outermost since Wishlist/Cart/Auth
// push toasts on various actions, and AuthProvider must wrap Wishlist/Cart
// since both are authenticated-only and read isAuthenticated from it.

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { MessageProvider } from '@/context/MessageContext';
import { WishlistProvider } from '@/context/WishlistContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MessageProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>{children}</CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </MessageProvider>
  );
}
