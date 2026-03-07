import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: "email" | "google";
}

interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setGuest: () => void;
  loginWithGoogle: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isGuest: true, // Tạm mặc định là guest khi vào app
  isLoading: false,

  login: (user: User) => {
    set({ user, isGuest: false });
  },

  logout: () => {
    set({ user: null, isGuest: true });
  },

  setGuest: () => {
    set({ user: null, isGuest: true });
  },

  // Mock function cho Google Login
  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      // Ở đây bạn sẽ tích hợp native Google Sign In hoặc Firebase, ví dụ:
      // const { idToken } = await GoogleSignin.signIn();
      // const credential = auth.GoogleAuthProvider.credential(idToken);
      // const res = await auth().signInWithCredential(credential);

      // Dùng timeout để giả lập call API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockGoogleUser: User = {
        id: "google_12345",
        name: "Người dùng Google",
        email: "user@gmail.com",
        avatar:
          "https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff",
        provider: "google",
      };

      set({ user: mockGoogleUser, isGuest: false, isLoading: false });
    } catch (error) {
      console.log("Error logging in with Google", error);
      set({ isLoading: false });
    }
  },
}));
