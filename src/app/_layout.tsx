import { Ultra_400Regular } from '@expo-google-fonts/ultra';
import { ZillaSlab_600SemiBold, ZillaSlab_700Bold } from '@expo-google-fonts/zilla-slab';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useHydrated } from '../store/hydration';
import { fonts, useTheme } from '../theme';

export default function RootLayout() {
  const hydrated = useHydrated();
  const [fontsLoaded] = useFonts({ Ultra_400Regular, ZillaSlab_700Bold, ZillaSlab_600SemiBold });
  const { c, dark } = useTheme();
  const ready = hydrated && fontsLoaded;

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
            headerTitleStyle: { fontFamily: fonts.slab, fontSize: 19 },
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: { backgroundColor: c.canvas },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="history" options={{ title: 'History' }} />
          <Stack.Screen
            name="award/[id]"
            options={{ presentation: 'formSheet', sheetAllowedDetents: [0.55], sheetGrabberVisible: true, headerShown: false }}
          />
          <Stack.Screen name="duel" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="how-to-play" options={{ title: 'House rules', presentation: 'modal', headerShown: false }} />
        </Stack>
      )}
    </SafeAreaProvider>
  );
}
