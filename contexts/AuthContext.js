import { createContext, useContext, useState, useEffect, use } from "react";
import AsyncStrorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStrorage.getItem("token");
        const storedUser = await AsyncStrorage.getItem("user");
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load auth. ", e);
      }
    };

    loadAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch("http://192.168.50.68:3000/login", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Login Failed");
      const { token, user } = await res.json();
      setToken(token);
      setUser(user);
      await AsyncStrorage.setItem("token", token);
      await AsyncStrorage.setItem("user", JSON.stringify(user));
      return true;
    } catch (e) {
      Alert.alert("Error", e.message);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await fetch("http://192.168.50.68:3000/register", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) throw new Error("Registration Failed");
      const { token, user } = await res.json();
      setToken(token);
      setUser(user);
      await AsyncStrorage.setItem("token", token);
      await AsyncStrorage.setItem("user", JSON.stringify(user));
      return true;
    } catch (e) {
      Alert.alert("Error", e.message);
      return false;
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStrorage.removeItem("token", token);
    await AsyncStrorage.removeItem("user", JSON.stringify(user));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
