import React, { useState, useCallback } from "react";
import { 
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView, 
  ImageBackground, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Modal,
  Linking
} from "react-native";
import { useRouter } from 'expo-router';
import { getUser, deleteUser, getBooks } from "../../database/dbFunctions";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

const SESSION_KEY = "userSession";

// ─── Tipos ───────────────────────────────────────────────
interface User {
  id: number;
  username: string;
  email?: string;
  image?: string | null;
  bio?: string;
}

// ─── Constantes ──────────────────────────────────────────
const APP_VERSION = "1.0.0";
const SUPPORT_EMAIL = "soporte@tuapp.com";
const PRIVACY_URL = "https://tuapp.com/privacidad";
const LIGHT_SENSOR_KEY = "lightSensorEnabled";
const BACKUP_KEY = "autoBackupEnabled";

// ─── Componente ──────────────────────────────────────────
export default function Ajustes() {

  const router = useRouter();

  const [autoMode, setAutoMode] = useState(false);
  const [backup, setBackup] = useState(false);
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Modales
  const [creditosModal, setCreditosModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);

  // ── Cargar usuario y preferencias guardadas ────────────
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const user = await getUser() as User | null;
        if (user) {
          setUsername(user.username ?? "");
          setProfileImage(user.image ?? null);
        }

        const savedSensor = await AsyncStorage.getItem(LIGHT_SENSOR_KEY);
        const savedBackup = await AsyncStorage.getItem(BACKUP_KEY);
        if (savedSensor !== null) setAutoMode(savedSensor === 'true');
        if (savedBackup !== null) setBackup(savedBackup === 'true');
      };
      loadData();
    }, [])
  );

  // ── Toggle sensor de luz ───────────────────────────────
  const handleSensorToggle = async (value: boolean) => {
    setAutoMode(value);
    await AsyncStorage.setItem(LIGHT_SENSOR_KEY, String(value));
  };

  // ── Toggle respaldo automático ─────────────────────────
  const handleBackupToggle = async (value: boolean) => {
    setBackup(value);
    await AsyncStorage.setItem(BACKUP_KEY, String(value));
    if (value) {
      await runBackup();
    }
  };

  // ── Respaldo: guarda JSON en el dispositivo ────────────
  const runBackup = async () => {
    try {
      const books = getBooks();
      const json = JSON.stringify(books, null, 2);
      const path = FileSystem.documentDirectory + 'backup_biblioteca.json';
      await FileSystem.writeAsStringAsync(path, json, {
        encoding: FileSystem.EncodingType.UTF8
      });
      console.log("Respaldo guardado en:", path);
    } catch (e) {
      console.error("Error al respaldar:", e);
    }
  };

  // ── Exportar como CSV ──────────────────────────────────
  const exportCSV = async () => {
    try {
      const books = getBooks();
      if (books.length === 0) {
        Alert.alert("Sin libros", "No hay libros para exportar.");
        return;
      }

      const headers = "titulo,autor,genero,estado,calificacion\n";
      const rows = books.map((b: any) =>
        `"${b.title ?? ''}","${b.author ?? ''}","${b.genre ?? ''}","${b.status ?? ''}","${b.rating ?? ''}"`
      ).join("\n");

      const csv = headers + rows;
      const path = FileSystem.documentDirectory + 'biblioteca.csv';
      await FileSystem.writeAsStringAsync(path, csv, {
        encoding: FileSystem.EncodingType.UTF8
      });

      await Sharing.shareAsync(path, {
        mimeType: 'text/csv',
        dialogTitle: 'Exportar biblioteca CSV',
        UTI: 'public.comma-separated-values-text'
      });

      setExportModal(false);
    } catch (e) {
      Alert.alert("Error", "No se pudo exportar el CSV.");
      console.error(e);
    }
  };

  // ── Exportar como PDF ──────────────────────────────────
  const exportPDF = async () => {
    try {
      const books = getBooks();
      if (books.length === 0) {
        Alert.alert("Sin libros", "No hay libros para exportar.");
        return;
      }

      const rows = books.map((b: any) => `
        <tr>
          <td>${b.title ?? '-'}</td>
          <td>${b.author ?? '-'}</td>
          <td>${b.genre ?? '-'}</td>
          <td>${b.status ?? '-'}</td>
          <td>${b.rating ?? '-'}</td>
        </tr>
      `).join('');

      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #3d2b1f; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background: #92A1A8; color: white; padding: 8px; text-align: left; }
              td { padding: 8px; border-bottom: 1px solid #ddd; }
              tr:nth-child(even) { background: #f5f0eb; }
            </style>
          </head>
          <body>
            <h1>Mi Biblioteca</h1>
            <p>Total de libros: ${books.length}</p>
            <table>
              <thead>
                <tr>
                  <th>Título</th><th>Autor</th><th>Género</th><th>Estado</th><th>Calificación</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Exportar biblioteca PDF',
        UTI: 'com.adobe.pdf'
      });

      setExportModal(false);
    } catch (e) {
      Alert.alert("Error", "No se pudo exportar el PDF.");
      console.error(e);
    }
  };

  // ── Eliminar cuenta ────────────────────────────────────
  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar cuenta",
      "¿Estás seguro? Esta acción no se puede deshacer. Se eliminarán todos tus datos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser();
              await AsyncStorage.clear();
              router.replace("/");
            } catch {
              Alert.alert("Error", "No se pudo exportar el CSV.");
            }
          }
        }
      ]
    );
  };

  // ─────────────────────────────────────────────────────
  return (
    <ImageBackground 
      source={require('../../assets/images/inicio.png')} 
      style={styles.background}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <Text style={styles.title}>Ajustes</Text>

          {/* PERFIL */}
          <TouchableOpacity 
            style={styles.profileCircle} 
            onPress={() => router.push("/perfil")}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileIcon} />
            ) : (
              <Image 
                source={require("../../assets/gui/calendario.png")} 
                style={styles.profileIcon}
              />
            )}
          </TouchableOpacity>

          <Text style={styles.username}>{username || "Usuario"}</Text>

          {/* SENSOR DE LUZ */}
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Modo automático (sensor de luz)</Text>
            <Switch value={autoMode} onValueChange={handleSensorToggle} />
          </View>

          {/* RESPALDO AUTOMÁTICO */}
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Respaldo automático</Text>
            <Switch value={backup} onValueChange={handleBackupToggle} />
          </View>

          {/* EXPORTAR BIBLIOTECA */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => setExportModal(true)}
          >
            <Text style={styles.buttonText}>Exportar biblioteca</Text>
          </TouchableOpacity>

          {/* VERSIÓN */}
          <TouchableOpacity 
            style={styles.button}
            onPress={() => Alert.alert("Versión", `Versión actual: ${APP_VERSION}`)}
          >
            <Text style={styles.buttonText}>Versión {APP_VERSION}</Text>
          </TouchableOpacity>

          {/* SOPORTE */}
          <TouchableOpacity 
            style={styles.button}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          >
            <Text style={styles.buttonText}>Soporte</Text>
          </TouchableOpacity>

          {/* POLÍTICAS */}
          <TouchableOpacity 
            style={styles.button}
            onPress={() => Linking.openURL(PRIVACY_URL)}
          >
            <Text style={styles.buttonText}>Políticas de privacidad</Text>
          </TouchableOpacity>

          {/* CRÉDITOS */}
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setCreditosModal(true)}
          >
            <Text style={styles.buttonText}>Créditos</Text>
          </TouchableOpacity>

          {/* ELIMINAR CUENTA */}
          <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteBtn}>
            <Text style={styles.footerLink}>Eliminar Cuenta</Text>
          </TouchableOpacity>

          <View style={{ height: 80 }} />

        </ScrollView>

        {/* BOTÓN REGRESAR */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push("/explore")}>
            <Image 
              source={require('../../assets/gui/regresar_atras.png')} 
              style={styles.navIcon} 
            />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      {/* ── MODAL EXPORTAR ── */}
      <Modal visible={exportModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Exportar biblioteca</Text>
            <Text style={styles.modalSubtitle}>Elige el formato</Text>

            <TouchableOpacity style={styles.modalBtn} onPress={exportPDF}>
              <Text style={styles.modalBtnText}>Exportar como PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={exportCSV}>
              <Text style={styles.modalBtnText}>Exportar como CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalBtn, styles.cancelBtn]} 
              onPress={() => setExportModal(false)}
            >
              <Text style={styles.modalBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── MODAL CRÉDITOS ── */}
      <Modal visible={creditosModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Créditos</Text>

            <Text style={styles.creditText}>Desarrollo</Text>
            <Text style={styles.creditName}>GARCIA MEDINA RODRIGO</Text>

            <Text style={styles.creditText}>Diseño & Assets</Text>
            <Text style={styles.creditName}>GARCIA MEDINA RODRIGO</Text>

            <Text style={styles.creditText}>Fuentes</Text>
            <Text style={styles.creditName}>CuteLettering · AlmondMilky</Text>

            <Text style={styles.creditText}>Tecnologías</Text>
            <Text style={styles.creditName}>React Native · Expo · SQLite</Text>

            <TouchableOpacity 
              style={[styles.modalBtn, { marginTop: 20 }]} 
              onPress={() => setCreditosModal(false)}
            >
              <Text style={styles.modalBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

// ─── Estilos ─────────────────────────────────────────────
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
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 100,
  },

  title: {
    fontSize: 40,
    fontFamily: "CuteLettering",
    color: "#3d2b1f",
    marginBottom: 20
  },

  profileCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#EADDCA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    overflow: "hidden",
  },

  profileIcon: {
    width: 130,
    height: 130,
    borderRadius: 65,
    resizeMode: "cover",
  },

  username: {
    fontFamily: "AlmondMilky",
    color: "#3d2b1f",
    marginBottom: 20,
    fontSize: 16
  },

  optionRow: {
    width: "70%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },

  optionText: {
    fontFamily: "AlmondMilky",
    fontSize: 14,
    color: "#3D464A",
    flex: 1,
    marginRight: 10
  },

  button: {
    width: "80%",
    backgroundColor: "#92A1A8",
    padding: 14,
    borderRadius: 20,
    marginBottom: 15
  },

  buttonText: {
    fontFamily: "AlmondMilky",
    color: "#fff",
    textAlign: "center",
    fontSize: 16
  },

  deleteBtn: {
    marginTop: 10,
    marginBottom: 20,
  },

  footerLink: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'AlmondMilky',
    color: '#c0392b',
  },

  footer: {
    position: 'absolute',
    bottom: 15,
    left: 10,
  },

  navIcon: { 
    width: 50, 
    height: 50, 
    resizeMode: 'contain' 
  },

  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '80%',
    backgroundColor: '#FFF8F0',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },

  modalTitle: {
    fontFamily: 'CuteLettering',
    fontSize: 28,
    color: '#3d2b1f',
    marginBottom: 5,
  },

  modalSubtitle: {
    fontFamily: 'AlmondMilky',
    fontSize: 14,
    color: '#3D464A',
    marginBottom: 20,
  },

  modalBtn: {
    width: '100%',
    backgroundColor: '#92A1A8',
    padding: 13,
    borderRadius: 15,
    marginBottom: 12,
  },

  cancelBtn: {
    backgroundColor: '#b0b8bc',
  },

  modalBtnText: {
    fontFamily: 'AlmondMilky',
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
  },

  creditText: {
    fontFamily: 'AlmondMilky',
    fontSize: 13,
    color: '#92A1A8',
    marginTop: 12,
  },

  creditName: {
    fontFamily: 'AlmondMilky',
    fontSize: 15,
    color: '#3d2b1f',
    marginBottom: 2,
  },

});