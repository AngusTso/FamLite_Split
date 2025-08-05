import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");
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
      if (!res.ok) {
        const errorData = await res.json(); // Parse the error response from the backend
        console.log(errorData);
        throw new Error(errorData.error || "Login Failed"); // Use backend error message if available
      }
      const { token, user } = await res.json();
      setToken(token);
      setUser(user);
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      return true;
    } catch (e) {
      Alert.alert("Error", e.message || t("login_failed"));
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

      if (!res.ok) {
        const errorData = await res.json(); // Parse the error response from the backend
        throw new Error(errorData.error || "Login Failed"); // Use backend error message if available
      }
      const { token, user } = await res.json();
      setToken(token);
      setUser(user);
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      return true;
    } catch (e) {
      Alert.alert("Error", e.message);
      return false;
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
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
