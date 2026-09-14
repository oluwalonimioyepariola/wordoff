import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useHydrated } from '../store/hydration';
import { useTheme } from '../theme';

export default function RootLayout() {
  const ready = useHydrated();
  const { c, dark } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {!ready ? (
        <View style={{ flex: 1, backgroundColor: c.canvas, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={c.ink} />
        </View>
      ) : (
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: c.canvas },
            headerTintColor: c.ink,
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: c.canvas },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="duel" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="how-to-play" options={{ title: 'How to duel', presentation: 'modal' }} />
        </Stack>
      )}
    </SafeAreaProvider>
  );
}
