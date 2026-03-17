import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Importaciones de Fuentes y Splash Screen
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Evita que la pantalla de carga se oculte automáticamente
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index', 
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // 1. CARGA DE FUENTES CUSTOM (.TTF)
  // Asegúrate de que los archivos en assets/fonts terminen en .ttf
  const [loaded, error] = useFonts({
    'AlmondMilky': require('../assets/fonts/Almond-Milky.ttf'),
    'CuteLettering': require('../assets/fonts/Cute-Lettering.ttf'),
  });

  // 2. MANEJO DE ERRORES Y OCULTAR SPLASH
  useEffect(() => {
    if (error) {
        console.error("Error cargando fuentes:", error);
        throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Si las fuentes no han cargado, mantenemos el Splash Screen
  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Tu pantalla principal (Login/index) */}
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        
        {/* El resto de la navegación por pestañas */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        
        <Stack.Screen 
          name="modal" 
          options={{ presentation: 'modal', title: 'Configuración' }} 
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}