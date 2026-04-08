import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, ImageBackground, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { insertUser, createUserTable } from '../database/dbFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = "userSession";


export default function Register() {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

   useEffect(() => {
    createUserTable(); // 🔥 ESTO DEBE CORRER SIEMPRE AL INICIAR
}, []);

  const router = useRouter();

  // ✅ Agrega este useEffect al inicio
  useEffect(() => {
    const checkSession = async () => {
      const session = await AsyncStorage.getItem(SESSION_KEY);
      if (session === 'true') {
        router.replace('/(tabs)/explore');
        return;
      }
      // Si no hay sesión, crea las tablas normalmente
      createUserTable();
    };

    checkSession();
  }, []);

  const handleRegister = async () => {

  if (!username || !email || !password || !confirmPassword) {
    Alert.alert('Error', 'Completa todos los campos');
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert('Error', 'Las contraseñas no coinciden');
    return;
  }

  try {

    await insertUser({
      username,
      email,
      password
    });

    Alert.alert('Éxito', 'Cuenta creada');

    router.replace('/login');

  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'No se pudo registrar');
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
            <Text style={styles.cardTitle}>Crear cuenta</Text>

            <View style={styles.inputContainer}>

              {/* Nombre de Usuario */}
              <TextInput
                style={styles.input}
                placeholder="Nombre de Usuario"
                placeholderTextColor="#F0F0F0"
                value={username}
                onChangeText={setUsername}
              />

              {/* Correo */}
              <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                placeholderTextColor="#F0F0F0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Contraseña */}
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#F0F0F0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {/* Confirmar Contraseña */}
              <TextInput
                style={styles.input}
                placeholder="Confirmar Contraseña"
                placeholderTextColor="#F0F0F0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

            </View>

            <TouchableOpacity 
              style={styles.mainButton} 
              onPress={handleRegister}
            >
              <Text style={styles.mainButtonText}>
                Crear Biblioteca
              </Text>
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                ¿Ya tienes una biblioteca? 
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/login')}
              >
                <Text style={styles.footerLink}>
                  Iniciar Sesión
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
    color: '#3d2b1f', // Café oscuro
    marginBottom: 40,
    lineHeight: 50,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // Blanco semitransparente
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
    backgroundColor: '#A3835E', // Color café de la imagen
    height: 50,
    borderRadius: 25,
    marginBottom: 15,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  mainButton: {
    backgroundColor: '#9D7681', // Color púrpura suave de la imagen
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
    color: '#A8AD96',
  },
});