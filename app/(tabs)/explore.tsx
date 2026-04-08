import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LightSensor, Accelerometer } from 'expo-sensors';
import { useFocusEffect } from '@react-navigation/native';
import BookFormModal from '../(tabs)/BookFormModal';
import BookDetailModal from '../(tabs)/BookDetailModal';
import { createTables, getBooks, createUserTable } from '../../database/dbFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const wp = (p: number) => (width * p) / 100;
const hp = (p: number) => (height * p) / 100;

type TimeOfDay = 'day' | 'afternoon' | 'night';

const LIGHT_SENSOR_KEY = "lightSensorEnabled";
const SHAKE_THRESHOLD = 1.8; // sensibilidad del agite

// ── Genera posición caótica para cada libro ───────────
const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const CozyRoomScreen: React.FC = () => {

  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(0);
  const BOOKS_PER_PAGE = 15;

  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [bookModal, setBookModal] = useState(false);

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');

  // ── Animación de libros ───────────────────────────────
  const [isShaking, setIsShaking] = useState(false);
  const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastShakeTime = useRef(0);

  // Animated values por libro (máximo BOOKS_PER_PAGE)
  const bookAnimations = useRef(
    Array.from({ length: 15 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;

  const loadBooks = () => {
    const data = getBooks();
    setBooks(data);
  };

  const setupLightSensor = async () => {
    const isAvailable = await LightSensor.isAvailableAsync();
    if (!isAvailable) return;

    LightSensor.setUpdateInterval(2000);
    LightSensor.addListener(({ illuminance }) => {
      if (illuminance > 1000)     setTimeOfDay('day');
      else if (illuminance > 100) setTimeOfDay('afternoon');
      else                        setTimeOfDay('night');
    });
  };

  // ── Animación: caída caótica ──────────────────────────
  const animateFall = () => {
    const animations = bookAnimations.map((anim) => {
      const targetY  = randomBetween(30, 120);
      const targetX  = randomBetween(-20, 20);
      const targetRot = randomBetween(-45, 45);

      return Animated.parallel([
        Animated.spring(anim.translateY, {
          toValue: targetY,
          useNativeDriver: true,
          speed: 3,
          bounciness: 8,
        }),
        Animated.spring(anim.translateX, {
          toValue: targetX,
          useNativeDriver: true,
          speed: 3,
          bounciness: 5,
        }),
        Animated.spring(anim.rotate, {
          toValue: targetRot,
          useNativeDriver: true,
          speed: 3,
          bounciness: 5,
        }),
      ]);
    });

    Animated.stagger(40, animations).start();
  };

  // ── Animación: regreso al orden ───────────────────────
  const animateReturn = () => {
    const animations = bookAnimations.map((anim) =>
      Animated.parallel([
        Animated.spring(anim.translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 2,
          bounciness: 10,
        }),
        Animated.spring(anim.translateX, {
          toValue: 0,
          useNativeDriver: true,
          speed: 2,
          bounciness: 10,
        }),
        Animated.spring(anim.rotate, {
          toValue: 0,
          useNativeDriver: true,
          speed: 2,
          bounciness: 10,
        }),
      ])
    );

    Animated.stagger(40, animations).start();
  };

  // ── Detectar agite ────────────────────────────────────
  const handleShake = () => {
    const now = Date.now();
    // Evita disparar múltiples veces seguidas
    if (now - lastShakeTime.current < 2000) return;
    lastShakeTime.current = now;

    setIsShaking(true);
    animateFall();

    // Limpia timeout anterior si existe
    if (shakeTimeout.current) clearTimeout(shakeTimeout.current);

    // Regresa al orden después de 4.5 segundos
    shakeTimeout.current = setTimeout(() => {
      animateReturn();
      setIsShaking(false);
    }, 4500);
  };

  // ── Setup acelerómetro ────────────────────────────────
  const setupAccelerometer = async () => {
    const isAvailable = await Accelerometer.isAvailableAsync();
    if (!isAvailable) {
      console.log("Acelerómetro no disponible");
      return;
    }

    Accelerometer.setUpdateInterval(100);

    Accelerometer.addListener(({ x, y, z }) => {
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      if (acceleration > SHAKE_THRESHOLD) {
        handleShake();
      }
    });
  };

  // ── Init al montar ────────────────────────────────────
  useEffect(() => {
    createUserTable();
    createTables();
    loadBooks();
    setupAccelerometer();

    return () => {
      Accelerometer.removeAllListeners();
      LightSensor.removeAllListeners();
      if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
    };
  }, []);

  // ── Sensor de luz al enfocar pantalla ─────────────────
  useFocusEffect(
    useCallback(() => {
      const initSensor = async () => {
        const saved = await AsyncStorage.getItem(LIGHT_SENSOR_KEY);
        const enabled = saved === null ? true : saved === 'true';

        LightSensor.removeAllListeners();

        if (enabled) setupLightSensor();
        else setTimeOfDay('day');
      };

      initSensor();

      return () => {
        LightSensor.removeAllListeners();
      };
    }, [])
  );

  const visibleBooks = books.slice(
    page * BOOKS_PER_PAGE,
    (page + 1) * BOOKS_PER_PAGE
  );

  return (
    <View style={styles.mainContainer}>
      
      <Image source={require('../../assets/gui/pared.png')} style={styles.pared} />

      <View style={styles.windowContainer}>
        <Image 
          source={
            timeOfDay === 'day'       ? require('../../assets/gui/dia.png') :
            timeOfDay === 'afternoon' ? require('../../assets/gui/tarde.png') :
                                        require('../../assets/gui/noche.png')
          } 
          style={styles.dia} 
        />
        <Image source={require('../../assets/gui/ventana.png')} style={styles.windowFrame} />
      </View>

      {timeOfDay === 'afternoon' && (
        <View pointerEvents="none" style={styles.lightOverlay}>
          <Image
            source={require('../../assets/gui/efecto_tarde.png')}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
          />
        </View>
      )}
      {timeOfDay === 'night' && (
        <View pointerEvents="none" style={styles.lightOverlay}>
          <Image
            source={require('../../assets/gui/efecto_noche.png')}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
          />
        </View>
      )}

      <Image source={require('../../assets/gui/piso.png')} style={styles.piso} />
      <Image source={require('../../assets/gui/tapete.png')} style={styles.tapete} />

      <View style={styles.shelfContainer}>
        <Image source={require('../../assets/gui/planta.png')} style={styles.planta} />
        <Image source={require('../../assets/gui/librero.png')} style={styles.librero} />
        <Image source={require('../../assets/gui/lampara.png')} style={styles.lampara} /> 
        <Image source={require('../../assets/gui/sillon.png')} style={styles.sillon} />

        {/* ── LIBROS CON ANIMACIÓN ── */}
        <View style={styles.booksContainer}>
          {visibleBooks.map((book, index) => {
            const anim = bookAnimations[index];
            const rotateInterpolated = anim.rotate.interpolate({
              inputRange: [-45, 0, 45],
              outputRange: ['-45deg', '0deg', '45deg'],
            });

            return (
              <Animated.View
                key={book.id}
                style={{
                  transform: [
                    { translateY: anim.translateY },
                    { translateX: anim.translateX },
                    { rotate: rotateInterpolated },
                  ],
                }}
              >
                <TouchableOpacity
                  style={{ marginRight: 1, marginBottom: 10 }}
                  onPress={() => {
                    if (isShaking) return; // no abrir modal si está animando
                    setSelectedBook({ ...book });
                    setBookModal(true);
                  }}
                >
                  <Image
                    source={
                      book.cover
                        ? { uri: book.cover }
                        : require('../../assets/gui/lomo_libro.png')
                    }
                    style={styles.bookSpine}
                  />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.atrilHitbox} 
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.atrilContainer} pointerEvents="none">
          <Image source={require('../../assets/gui/atril.png')} style={styles.atrilImage} />
        </View>
        <View style={styles.hitboxArea} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.settingsBtn} 
        onPress={() => router.push("/ajustes")}
      >
        <Image source={require('../../assets/gui/ajustes2.png')} style={styles.iconImage}/>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.nextPageBtn}
        onPress={() => setPage(page + 1)}
      >
        <Image source={require('../../assets/gui/regresar.png')} style={styles.pageIcon} />
      </TouchableOpacity>

      {page > 0 && (
        <TouchableOpacity
          style={styles.prevPageBtn}
          onPress={() => setPage(page - 1)}
        >
          <Image source={require('../../assets/gui/regresar_atras.png')} style={styles.pageIcon} />
        </TouchableOpacity>
      )}

      <BookFormModal 
        visible={modalVisible} 
        onClose={() => {
          setModalVisible(false);
          loadBooks();
        }} 
      />

      <BookDetailModal
        visible={bookModal}
        book={selectedBook}
        onClose={() => setBookModal(false)}
        onRefresh={loadBooks}
      />

    </View>
  );
};

const styles = StyleSheet.create({

  mainContainer: { flex: 1 },

  pared: {
    position: 'absolute', top: 0,
    width: '100%', height: hp(75), resizeMode: 'cover' 
  }, 
  
  piso: { 
    position: 'absolute', bottom: 0,
    width: '100%', height: hp(40), resizeMode: 'cover'
  },

  windowContainer:{ 
    position: 'absolute', top: hp(4), right: wp(8),
    width: wp(40), height: hp(28),
    justifyContent: 'center', alignItems: 'center'
  },

  dia: { 
    position: 'absolute', width: '90%', height: '80%', resizeMode: 'cover'
  },

  windowFrame:{ width: '190%', height: '190%', resizeMode: 'contain' },

  tapete: { 
    position: 'absolute', bottom: -hp(6), alignSelf: 'center',
    width: wp(98), height: hp(50), resizeMode: 'contain'
  },

  shelfContainer:{ 
    position: 'absolute', bottom: hp(1), left: wp(-14),
  },

  librero:{ width: wp(97), height: hp(97), resizeMode: 'contain' },

  planta:{ 
    position: 'absolute', top: hp(10), left: wp(28),
    width: wp(37), height: hp(37), resizeMode: 'contain' 
  },

  lampara: { 
    position: 'absolute', bottom: hp(3), right: -wp(40),
    width: wp(80), height: hp(90), resizeMode: 'contain'
  }, 
  
  sillon: { 
    position: 'absolute', bottom: hp(1), left: wp(6),
    width: wp(69), height: hp(60), resizeMode: 'contain'
  },

  booksContainer:{
    position: 'absolute',
    top: hp(35),
    left: wp(24),
    width: wp(50),
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  bookSpine:{
    width: 30, height: 47,
    resizeMode: 'cover', marginRight: 5
  },

  atrilHitbox: {
    position: 'absolute', bottom: hp(9.5), right: wp(8), zIndex: 20,
  },

  atrilImage: { width: wp(48), height: hp(40), resizeMode: 'contain' },

  hitboxArea: { width: wp(40), height: hp(20), borderRadius: 20 },

  atrilContainer: {
    position: 'absolute', bottom: -hp(10), right: -wp(2), zIndex: 5,
  },

  settingsBtn: { position: 'absolute', top: 50, left: 20 },

  iconImage: { width: 80, height: 80 },

  nextPageBtn: {
    position: 'absolute', bottom: hp(34), right: wp(35),
    backgroundColor: 'transparent', borderRadius: 30,
    width: 60, height: 60,
    justifyContent: 'center', alignItems: 'center'
  },

  prevPageBtn: {
    position: 'absolute', top: 258, left: 20,
    backgroundColor: 'transparent', borderRadius: 30,
    width: 50, height: 50,
    justifyContent: 'center', alignItems: 'center'
  },

  pageIcon: { width: 40, height: 40, resizeMode: 'contain' },

  lightOverlay: {
    position: 'absolute', top: 0, left: 0,
    width: '100%', height: '100%',
    zIndex: -0.5, opacity: 0.4,
  },

});

export default CozyRoomScreen;