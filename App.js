import { SocketProvider } from "./contexts/SocketContext";
import { NavigationContainer } from "@react-navigation/native";
import Navigator from "./navigation/Navigator";
import { AuthProvider } from "./contexts/AuthContext";
export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NavigationContainer>
          <Navigator />
        </NavigationContainer>
      </SocketProvider>
    </AuthProvider>
  );
}
