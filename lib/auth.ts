// Simple client-side "auth" for testing PostHog identification
// NOT production-ready - just for Day 7 testing!

export interface User {
  email: string;
  name?: string;
}

const USER_KEY = "taskflow_user";

export const auth = {
  // Save user to localStorage (simulating login)
  login: (email: string, name?: string): User => {
    const user: User = { email, name };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  // Remove user from localStorage (logout)
  logout: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  // Get current user
  getUser: (): User | null => {
    if (typeof window === "undefined") return null;

    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  // Check if user is logged in
  isAuthenticated: (): boolean => {
    return auth.getUser() !== null;
  },
};
