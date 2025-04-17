import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import ShareTaskBoard from "../screens/ShareTaskBoard";
import GroupSelectionScreen from "../screens/GroupSelectionScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

import { useAuth } from "../contexts/AuthContext";

const Stack = createStackNavigator();

export default function Navigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="GroupSelectionScreen"
            component={GroupSelectionScreen}
          />
          <Stack.Screen name="ShareTaskBoard" component={ShareTaskBoard} />
        </>
      ) : (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
