import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getUser, updateUser, updatePassword, getBookStats } from "../../database/dbFunctions";

interface User {
  id: number;
  username: string;
  bio: string;
  image: string | null;
  password: string;
}

export default function Perfil() {

  const router = useRouter();

  const [userId, setUserId] = useState<number | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  // Estadísticas reales desde la DB
  const [totalBooks, setTotalBooks] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [booksMonth, setBooksMonth] = useState(0);
  const [favoriteGenre, setFavoriteGenre] = useState("—");

  // Modal cambiar contraseña
  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const user = await getUser() as User | null;
      if (user) {
        setUserId(user.id);
        setUsername(user.username || "");
        setBio(user.bio || "");
        setProfileImage(user.image || null);
        setStoredPassword(user.password || "");
      }

      const stats = getBookStats();
      setTotalBooks(stats.totalBooks);
      setAverageRating(stats.averageRating);
      setBooksMonth(stats.booksThisMonth);
      setFavoriteGenre(stats.favoriteGenre);
    };

    loadData();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Activa permisos de galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfileImage(base64Uri);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert("Error", "Usuario no encontrado");
      return;
    }

    await updateUser({
      id: userId,
      username,
      bio,
      image: profileImage,
    });

    Alert.alert("Guardado", "Perfil actualizado correctamente");
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    if (currentPassword !== storedPassword) {
      Alert.alert("Error", "La contraseña actual es incorrecta");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "Las contraseñas nuevas no coinciden");
      return;
    }

    if (newPassword.length < 4) {
      Alert.alert("Error", "La contraseña debe tener al menos 4 caracteres");
      return;
    }

    const success = await updatePassword(userId!, newPassword);

    if (success) {
      setStoredPassword(newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordModal(false);
      Alert.alert("Éxito", "Contraseña actualizada correctamente");
    } else {
      Alert.alert("Error", "No se pudo actualizar la contraseña");
    }
  };

  const handleLogout = () => {
    Alert.alert("Sesión cerrada");
    router.replace("/login");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/inicio.png")}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>

          {/* BOTÓN REGRESAR */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Image
                source={require("../../assets/gui/regresar_atras.png")}
                style={styles.navIcon}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Perfil</Text>

          {/* IMAGEN PERFIL */}
          <TouchableOpacity style={styles.profileCircle} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Text style={styles.addText}>Añadir</Text>
            )}
          </TouchableOpacity>

          {/* INPUTS */}
          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            placeholderTextColor="#fff"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            style={styles.input}
            placeholder="Frase personal"
            placeholderTextColor="#fff"
            value={bio}
            onChangeText={setBio}
          />

          {/* ESTADÍSTICAS */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalBooks}</Text>
              <Text style={styles.statLabel}>Libros</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{averageRating}</Text>
              <Text style={styles.statLabel}>Promedio</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{booksMonth}</Text>
              <Text style={styles.statLabel}>Este mes</Text>
            </View>
            <View style={styles.statBox}>
              <Text
                style={styles.statNumber}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {favoriteGenre}
              </Text>
              <Text style={styles.statLabel}>Género fav.</Text>
            </View>
          </View>

          {/* CAMBIAR CONTRASEÑA */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setPasswordModal(true)}
          >
            <Text style={styles.buttonText}>Cambiar contraseña</Text>
          </TouchableOpacity>

          {/* GUARDAR */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Guardar cambios</Text>
          </TouchableOpacity>

          {/* CERRAR SESIÓN */}
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL CAMBIAR CONTRASEÑA */}
      <Modal
        visible={passwordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <Text style={styles.modalTitle}>Cambiar contraseña</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Contraseña actual"
              placeholderTextColor="#fff"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Nueva contraseña"
              placeholderTextColor="#fff"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Confirmar nueva contraseña"
              placeholderTextColor="#fff"
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.buttonText}>Guardar contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setPasswordModal(false);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmNewPassword("");
            }}>
              <Text style={styles.logoutText}>Cancelar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({

  background: {
    flex: 1,
    resizeMode: "cover",
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  backBtn: {
    width: "95%",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  title: {
    fontSize: 40,
    fontFamily: "CuteLettering",
    color: "#3d2b1f",
    marginBottom: 20,
  },

  profileCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#EADDCA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },

  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 65,
  },

  addText: {
    fontFamily: "AlmondMilky",
    color: "#3d2b1f",
  },

  input: {
    width: "80%",
    backgroundColor: "#A3835E",
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    color: "#fff",
    textAlign: "center",
    fontFamily: "AlmondMilky",
  },

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 5,
  },

  statBox: {
    width: "40%",
    backgroundColor: "#EADDCA",
    margin: 10,
    padding: 10,
    borderRadius: 15,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 18,
    fontFamily: "AlmondMilky",
    color: "#3d2b1f",
  },

  statLabel: {
    fontSize: 12,
    color: "#555",
  },

  button: {
    width: "80%",
    backgroundColor: "#92A1A8",
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },

  saveButton: {
    width: "80%",
    backgroundColor: "#8b6b7a",
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "AlmondMilky",
  },

  logoutText: {
    color: "#3d2b1f",
    fontFamily: "AlmondMilky",
    fontSize: 16,
    marginBottom: 10,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "102%",
    position: "absolute",
    bottom: 55 + 10,
  },

  navIcon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#F5ECD7",
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 22,
    fontFamily: "CuteLettering",
    color: "#3d2b1f",
    marginBottom: 20,
  },

  modalInput: {
    width: "100%",
    backgroundColor: "#A3835E",
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    color: "#fff",
    textAlign: "center",
    fontFamily: "AlmondMilky",
  },

});