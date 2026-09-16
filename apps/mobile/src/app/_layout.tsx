import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useFonts } from 'expo-font';
import { WorkSans_600SemiBold, WorkSans_700Bold } from '@expo-google-fonts/work-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useFonts({
    WorkSans_600SemiBold,
    WorkSans_700Bold,
    'Roboto-Regular': require('../../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('../../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('../../assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Black': require('../../assets/fonts/Roboto-Black.ttf'),
  });

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      })
  );

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ThemedShell />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

// Split out so it can call `useTheme()` — the provider has to sit above it.
function ThemedShell() {
  const { colors, mode } = useTheme();

  // Keeps the native window background (visible behind sheets and during
  // rotation) in step with the active theme.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.page).catch(() => {});
  }, [colors.page]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.page }}>
      <View style={{ flex: 1, backgroundColor: colors.page }}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.page } }} />
      </View>
    </GestureHandlerRootView>
  );
}
