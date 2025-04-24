import { SocketProvider } from "./contexts/SocketContext";
import { NavigationContainer } from "@react-navigation/native";
import Navigator from "./navigation/Navigator";
import { AuthProvider } from "./contexts/AuthContext";
import { I18nextProvider } from "react-i18next";
import i18next from "./i18n";

export default function App() {
  return (
    <I18nextProvider i18n={i18next}>
      <AuthProvider>
        <SocketProvider>
          <NavigationContainer>
            <Navigator />
          </NavigationContainer>
        </SocketProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}
