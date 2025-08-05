import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    const success = await login(email, password);
    if (success) {
      navigation.replace("GroupSelectionScreen");
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("login_title")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("email")}
        placeholderTextColor="#72767d"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder={t("password")}
        placeholderTextColor="#72767d"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{t("login")}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
        <Text style={styles.link}>{t("register_link")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2f3136",
    padding: wp("5%"),
    justifyContent: "center",
  },
  title: {
    fontSize: wp("6%"),
    color: "#dcddde",
    textAlign: "center",
    marginBottom: hp("5%"),
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: wp("3%"),
    marginBottom: hp("2%"),
    fontSize: wp("4%"),
    color: "#333",
  },
  button: {
    backgroundColor: "#5865f2",
    borderRadius: 5,
    padding: wp("3%"),
    marginBottom: hp("2%"),
  },
  buttonText: {
    color: "#fff",
    fontSize: wp("4%"),
    fontWeight: "bold",
    textAlign: "center",
  },
  link: {
    color: "#5865f2",
    fontSize: wp("3.5%"),
    textAlign: "center",
  },
});
