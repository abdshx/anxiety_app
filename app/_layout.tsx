import 'react-native-url-polyfill/auto';
import { Stack } from "expo-router";
import "./globals.css";
import { StatusBar } from "react-native";
import { useFonts, DancingScript_700Bold } from "@expo-google-fonts/dancing-script";
import { Oswald_400Regular } from "@expo-google-fonts/oswald";
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DancingScript_700Bold, 
    Oswald_400Regular,
  });

  useEffect(() => {
    if (error) {
      console.error("Error loading fonts", error);
    }
    // Hide splash screen when fonts are loaded OR if there's an error so the app doesn't hang
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar hidden={true} />
          <Stack>
            <Stack.Screen
              name="index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Movie"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
