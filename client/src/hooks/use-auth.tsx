import { createContext, ReactNode, useContext } from "react";

type AuthContextType = {
  user: any;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: { username: "user", id: 1 },
  isLoading: false
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: { username: "user", id: 1 },
        isLoading: false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}