import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import BookFormModal from '../(tabs)/BookFormModal';

const { width, height } = Dimensions.get('window');

const wp = (p: number) => (width * p) / 100;
const hp = (p: number) => (height * p) / 100;

const CozyRoomScreen: React.FC = () => {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);

  const handleBookPress = () => {
    console.log("Abriendo el libro...");
  };

  return (
    <View style={styles.mainContainer}>
      
      {/* --- CAPA 1: ESTRUCTURA BASE --- */}
      <Image source={require('../../assets/gui/pared.png')} style={styles.pared} />
      <Image source={require('../../assets/gui/piso.png')} style={styles.piso} />

      {/* --- CAPA 2: VENTANA --- */}
      <View style={styles.windowContainer}>
        <Image source={require('../../assets/gui/dia.png')} style={styles.dia} />
        <Image source={require('../../assets/gui/ventana.png')} style={styles.windowFrame} />
      </View>

      {/* --- CAPA 3: DECORACIÓN Y MUEBLES --- */}
      <Image source={require('../../assets/gui/tapete.png')} style={styles.tapete} />
      
      <View style={styles.shelfContainer}>
        <Image source={require('../../assets/gui/planta.png')} style={styles.planta} />
        <Image source={require('../../assets/gui/librero.png')} style={styles.librero} />
      </View>

      <Image source={require('../../assets/gui/lampara.png')} style={styles.lampara} />
      <Image source={require('../../assets/gui/sillon.png')} style={styles.sillon} />

      {/* --- CAPA 4: ATRIL (SOLO IMAGEN) --- */}
      <TouchableOpacity 
        style={styles.atrilHitbox} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.5}
      >
        {/* Usamos pointerEvents="none" para que la imagen no bloquee toques de otros elementos */}
        <View style={styles.atrilContainer} pointerEvents="none">
          <Image source={require('../../assets/gui/atril.png')} style={styles.atrilImage} />
        </View>
        {/* Este View vacío define el área real de toque sobre el libro */}
        <View style={styles.hitboxArea} />
      </TouchableOpacity>

      {/* LLAMADA AL COMPONENTE EXTERNO */}
      <BookFormModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />

      {/* Icono de configuración */}
      <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push("/ajustes")}>
        <Image source={require('../../assets/gui/ajustes2.png')} style={styles.iconImage}/>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  pared: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: hp(75),
    resizeMode: 'cover',
  },
  piso: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: hp(40),
    resizeMode: 'cover',
  },
  windowContainer: {
    position: 'absolute',
    top: hp(4),
    right: wp(8),
    width: wp(40),
    height: hp(28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dia: {
    position: 'absolute',
    width: '90%',
    height: '80%',
    resizeMode: 'cover',
  },
  windowFrame: {
    width: '190%',
    height: '190%',
    resizeMode: 'contain',
  },
  tapete: {
    position: 'absolute',
    bottom: -hp(6),
    alignSelf: 'center',
    width: wp(105),
    height: hp(50),
    resizeMode: 'contain',
  },
  shelfContainer: {
    position: 'absolute',
    bottom: hp(1),
    left: wp(-14),
  },
  librero: {
    width: wp(97),
    height: hp(97),
    resizeMode: 'contain',
  },
  planta: {
    position: 'absolute',
    top: hp(10),
    left: wp(15),
    width: wp(37),
    height: hp(37),
    resizeMode: 'contain',
  },
  lampara: {
    position: 'absolute',
    bottom: hp(3),
    right: -wp(24),
    width: wp(80),
    height: hp(90),
    resizeMode: 'contain',
  },
  sillon: {
    position: 'absolute',
    bottom: hp(1),
    left: -wp(3),
    width: wp(69),
    height: hp(60),
    resizeMode: 'contain',
  },
  atrilContainer: {
    position: 'absolute',
    bottom: -hp(10),
    right: -wp(2),
    zIndex: 5,
  },
  atrilImage: {
    width: wp(48),
    height: hp(40),
    resizeMode: 'contain',
  },
  atrilHitbox: {
    position: 'absolute',
    // Estos valores deben coincidir con la posición visual del libro
    bottom: hp(9.5), 
    right: wp(8),
    zIndex: 20, 
  },
  hitboxArea: {
    width: wp(40),  
    height: hp(20),
    //backgroundColor: 'rgba(255, 0, 0, 0.3)', // Descomenta para ver el área de toque
    borderRadius: 20,
  },
  settingsBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 30,
  },
  iconImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
});

export default CozyRoomScreen;