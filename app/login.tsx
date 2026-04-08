import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, ImageBackground, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { loginUser } from '../database/dbFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = "userSession";
export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {

  if (!email || !password) {
    Alert.alert('Error', 'Por favor completa todos los campos');
    return;
  }

  try {

    const user = await loginUser(email, password) as any;

    if (!user) {
      Alert.alert('Error', 'Correo o contraseña incorrectos');
      return;
    }

// ✅ Guarda la sesión
    await AsyncStorage.setItem(SESSION_KEY, 'true')

    Alert.alert('Bienvenido', user.username);

    router.replace('/(tabs)/explore');

  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'Algo salió mal');
  }
};

  return (
    <ImageBackground 
      source={require('../assets/images/inicio.png')} 
      style={styles.background}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.headerTitle}>
            BIBLIOTECA{"\n"}PERSONAL
          </Text>

          <View style={styles.card}>

            <Text style={styles.cardTitle}>
              Iniciar Sesión
            </Text>

            <View style={styles.inputContainer}>

              <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                placeholderTextColor="#F0F0F0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#F0F0F0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

            </View>

            <TouchableOpacity 
              style={styles.mainButton} 
              onPress={handleLogin}
            >
              <Text style={styles.mainButtonText}>
                Iniciar Sesión
              </Text>
            </TouchableOpacity>

            <View style={styles.footerContainer}>

              <Text style={styles.footerText}>
                ¿No tienes una biblioteca?
              </Text>

              <TouchableOpacity 
                onPress={() => router.push('/')}
              >
                <Text style={styles.footerLink}>
                  Crear Cuenta
                </Text>
              </TouchableOpacity>

            </View>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  headerTitle: {
    fontFamily: 'CuteLettering',
    fontSize: 45,
    textAlign: 'center',
    color: '#3d2b1f',
    marginBottom: 40,
    lineHeight: 50,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 35,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#000',
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    fontFamily: 'AlmondMilky',
    backgroundColor: '#a68a64',
    height: 50,
    borderRadius: 25,
    marginBottom: 15,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  mainButton: {
    backgroundColor: '#8b6b7a',
    width: '100%',
    height: 55,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  mainButtonText: {
    fontFamily: 'AlmondMilky',
    color: '#fff',
    fontSize: 18,
  },
  footerContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#555',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#a68a64',
  },
});