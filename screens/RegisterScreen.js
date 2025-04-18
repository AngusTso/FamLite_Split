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

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "password must be at least 6 characters");
      return;
    }

    const success = await register(username, email, password);
    if (success) {
      navigation.replace("GroupSelectionScreen");
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register for Famlite</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#72767d"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#72767d"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#72767d"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  link: {
    color: "#5865f2",
    fontSize: wp("3.5%"),
    textAlign: "center",
  },
});
