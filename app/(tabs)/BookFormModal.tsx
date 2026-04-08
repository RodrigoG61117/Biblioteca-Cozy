import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  ImageBackground, 
  TouchableOpacity, 
  Image, 
  TextInput,
  Dimensions, Alert, ScrollView
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { insertBook, updateBook } from '../../database/dbFunctions';

const { width, height } = Dimensions.get('window');
const wp = (p: number) => (width * p) / 100;
const hp = (p: number) => (height * p) / 100;

interface Props {
  visible: boolean;
  onClose: () => void;
  book?: any;
  isEditing?: boolean;
}

const BookFormModal: React.FC<Props> = ({ visible, onClose, book, isEditing }) => {

  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [synopsis, setSynopsis] = useState("");

  const [cover, setCover] = useState<string | null>(null);
  const [stars, setStars] = useState([0,0,0,0,0]);
  const [tears, setTears] = useState([0,0,0,0,0]);
  const [spicy, setSpicy] = useState([0,0,0,0,0]);
  const [format, setFormat] = useState("");
  const [formatModal, setFormatModal] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [mainCharacters, setMainCharacters] = useState([""]);
  const [favoriteCharacters, setFavoriteCharacters] = useState([""]);
  const [hatedCharacters, setHatedCharacters] = useState([""]);

  const [favoriteScene, setFavoriteScene] = useState("");
  const [favoriteQuotes, setFavoriteQuotes] = useState([""]);
  const [song, setSong] = useState("");

  useEffect(() => {
    if (book) {
      setTitle(book.title || "");
      setAuthor(book.author || "");
      setGenre(book.genre || "");
      setFormat(book.format || "");
      setSynopsis(book.synopsis || "");

      setCover(book.cover || null);

      setStars(book.stars || [0,0,0,0,0]);
      setTears(book.tears || [0,0,0,0,0]);
      setSpicy(book.spicy || [0,0,0,0,0]);

      setMainCharacters(book.mainCharacters?.length ? book.mainCharacters : [""]);
      setFavoriteCharacters(book.favoriteCharacters?.length ? book.favoriteCharacters : [""]);
      setHatedCharacters(book.hatedCharacters?.length ? book.hatedCharacters : [""]);

      setFavoriteScene(book.favoriteScene || "");
      setFavoriteQuotes(book.favoriteQuotes?.length ? book.favoriteQuotes : [""]);
      setSong(book.song || "");

      // ✅ FIX: las fechas vienen como string ISO desde la BD, convertir a Date
      setStartDate(book.startDate ? new Date(book.startDate) : null);
      setEndDate(book.endDate   ? new Date(book.endDate)   : null);
    }
  }, [book]);

  const changeRating = (index: number, current: number[], setter: any) => {
    const newArray = [0,0,0,0,0];

    if (current[index] === 0) {
      for (let i = 0; i < index; i++) newArray[i] = 2;
      newArray[index] = 1;
    } else if (current[index] === 1) {
      for (let i = 0; i <= index; i++) newArray[i] = 2;
    }
    // si es 2 → queda todo en 0

    setter(newArray);
  };

  const addCharacter  = () => setMainCharacters([...mainCharacters, ""]);
  const addFavorite   = () => setFavoriteCharacters([...favoriteCharacters, ""]);
  const addHated      = () => setHatedCharacters([...hatedCharacters, ""]);
  const addQuote      = () => setFavoriteQuotes([...favoriteQuotes, ""]);

  const updateCharacter = (text: string, index: number) => {
    const n = [...mainCharacters]; n[index] = text; setMainCharacters(n);
  };
  const updateFavorite = (text: string, index: number) => {
    const n = [...favoriteCharacters]; n[index] = text; setFavoriteCharacters(n);
  };
  const updateHated = (text: string, index: number) => {
    const n = [...hatedCharacters]; n[index] = text; setHatedCharacters(n);
  };
  const updateQuote = (text: string, index: number) => {
    const n = [...favoriteQuotes]; n[index] = text; setFavoriteQuotes(n);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { alert("Se necesitan permisos para acceder a la galería"); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (!result.canceled) setCover(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { alert("Se necesitan permisos para usar la cámara"); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) setCover(result.assets[0].uri);
  };

  const openImageMenu = () => {
    Alert.alert("Añadir portada", "Selecciona una opción", [
      { text: "Cámara",   onPress: takePhoto },
      { text: "Galería",  onPress: pickImage },
      { text: "Cancelar", style: "cancel"    },
    ]);
  };

  const saveBook = () => {
    if (!title || !author || !genre || !format) {
      Alert.alert("Error", "Completa los campos principales");
      return;
    }
    if (stars.every(s => s === 0)) {
      Alert.alert("Error", "Agrega una calificación");
      return;
    }

    const newBook = {
      id: book?.id,
      title,
      author,
      genre,
      format,
      cover,
      stars,
      tears,
      spicy,
      // ✅ FIX: pasar string ISO para que dbFunctions lo guarde correctamente
      startDate: startDate ? startDate.toISOString() : null,
      endDate:   endDate   ? endDate.toISOString()   : null,
      synopsis,
      mainCharacters,
      favoriteCharacters,
      hatedCharacters,
      favoriteScene,
      favoriteQuotes,
      song,
    };

    if (isEditing) {
      updateBook(newBook);
      Alert.alert("Actualizado", "Libro actualizado");
    } else {
      insertBook(newBook);
      Alert.alert("Éxito", "Libro guardado");
    }

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setCover(null);
    setTitle(""); setAuthor(""); setGenre(""); setFormat("");
    setStars([0,0,0,0,0]); setSpicy([0,0,0,0,0]); setTears([0,0,0,0,0]);
    setStartDate(null); setEndDate(null);
    setSynopsis("");
    setMainCharacters([""]); setFavoriteCharacters([""]); setHatedCharacters([""]);
    setFavoriteScene(""); setFavoriteQuotes([""]); setSong("");
    setPage(1);
  };

  const renderContent = () => {
    switch (page) {

      case 1:
        return (
          <View style={styles.formContainer}>
            <TouchableOpacity style={styles.addPhotoBtn} onPress={openImageMenu}>
              {cover
                ? <Image source={{ uri: cover }} style={styles.coverPreview} />
                : <>
                    <Image source={require('../../assets/gui/camara.png')} style={styles.cameraIcon} />
                    <Text style={styles.btnText}>Añadir portada</Text>
                  </>
              }
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Título del libro"
              placeholderTextColor="#ffffff"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Autor/a"
              placeholderTextColor="#ffffff"
              value={author}
              onChangeText={setAuthor}
            />
            <TextInput
              style={styles.input}
              placeholder="Género"
              placeholderTextColor="#ffffff"
              value={genre}
              onChangeText={setGenre}
            />

            <TouchableOpacity style={styles.formatBtn} onPress={() => setFormatModal(true)}>
              <Text style={styles.btnText}>{format ? format : "Formato"}</Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.ratingTitle}>Calificación</Text>
            <View style={styles.starsContainer}>
              {stars.map((star, index) => {
                let image;
                if (star === 0) image = require('../../assets/gui/estrella_vacia.png');
                else if (star === 1) image = require('../../assets/gui/estrella_media.png');
                else image = require('../../assets/gui/estrella_completa.png');
                return (
                  <TouchableOpacity key={index} onPress={() => changeRating(index, stars, setStars)}>
                    <Image source={image} style={styles.star} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* CALENDARIOS */}
            <View style={styles.calendarContainer}>
              <TouchableOpacity onPress={() => setShowStartPicker(true)}>
                <Image source={require('../../assets/gui/calendario.png')} style={styles.calendarIcon} />
                <Text style={styles.calendarText}>
                  {/* ✅ FIX: mostrar fecha correctamente desde objeto Date */}
                  {startDate ? startDate.toLocaleDateString('es-MX') : "Inicio"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowEndPicker(true)}>
                <Image source={require('../../assets/gui/calendario.png')} style={styles.calendarIcon} />
                <Text style={styles.calendarText}>
                  {endDate ? endDate.toLocaleDateString('es-MX') : "Fin"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* SINOPSIS */}
            <TextInput
              style={styles.synopsisInput}
              placeholder="Sinopsis del libro..."
              placeholderTextColor="#ffffff"
              multiline
              value={synopsis}
              onChangeText={setSynopsis}
            />

            {/* DATE PICKERS */}
            {showStartPicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowStartPicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowEndPicker(false);
                  if (date) setEndDate(date);
                }}
              />
            )}
          </View>
        );

      case 3:
        return (
          <ScrollView style={{ width: "40%", maxHeight: hp(50), top: -hp(2) }}>

            {/* LÁGRIMAS */}
            <Text style={styles.sectionTitle}>Lágrimas derramadas</Text>
            <View style={styles.ratingContainer}>
              {tears.map((tear, index) => {
                let image;
                if (tear === 0) image = require('../../assets/gui/lagrima_vacia.png');
                else if (tear === 1) image = require('../../assets/gui/lagrima_media.png');
                else image = require('../../assets/gui/lagrimas_llena.png');
                return (
                  <TouchableOpacity key={index} onPress={() => changeRating(index, tears, setTears)}>
                    <Image source={image} style={styles.star} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* SPICY */}
            <Text style={styles.sectionTitle}>Nivel de Spicy</Text>
            <View style={styles.ratingContainer}>
              {spicy.map((s, index) => {
                let image;
                if (s === 0) image = require('../../assets/gui/chile_vacio.png');
                else if (s === 1) image = require('../../assets/gui/chile_medio.png');
                else image = require('../../assets/gui/chile_lleno.png');
                return (
                  <TouchableOpacity key={index} onPress={() => changeRating(index, spicy, setSpicy)}>
                    <Image source={image} style={styles.star} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* PERSONAJES PRINCIPALES */}
            <Text style={styles.sectionTitle}>Personajes principales</Text>
            {mainCharacters.map((char, index) => (
              <TextInput
                key={index}
                style={styles.inputRating}
                placeholder="Nombre del personaje"
                placeholderTextColor="#fff"
                value={char}
                onChangeText={(text) => updateCharacter(text, index)}
              />
            ))}
            <TouchableOpacity onPress={addCharacter}>
              <Text style={styles.addMore}>+ Añadir personaje</Text>
            </TouchableOpacity>

            {/* PERSONAJES FAVORITOS */}
            <Text style={styles.sectionTitle}>Personaje/s favorito/s</Text>
            {favoriteCharacters.map((char, index) => (
              <TextInput
                key={index}
                style={styles.inputRating}
                placeholder="Personaje favorito"
                placeholderTextColor="#fff"
                value={char}
                onChangeText={(text) => updateFavorite(text, index)}
              />
            ))}
            <TouchableOpacity onPress={addFavorite}>
              <Text style={styles.addMore}>+ Añadir favorito</Text>
            </TouchableOpacity>

            {/* PERSONAJES ODIADOS */}
            <Text style={styles.sectionTitle}>Personaje/s más odiado/s</Text>
            {hatedCharacters.map((char, index) => (
              <TextInput
                key={index}
                style={styles.inputRating}
                placeholder="Personaje odiado"
                placeholderTextColor="#fff"
                value={char}
                onChangeText={(text) => updateHated(text, index)}
              />
            ))}
            <TouchableOpacity onPress={addHated}>
              <Text style={styles.addMore}>+ Añadir personaje odiado</Text>
            </TouchableOpacity>

          </ScrollView>
        );

      case 4:
        return (
          <ScrollView style={{ width: "40%", maxHeight: hp(50), top: -hp(2) }}>

            <Text style={styles.sectionTitle}>Escena favorita</Text>
            <TextInput
              style={styles.bigInput}
              placeholder="Describe tu escena favorita..."
              placeholderTextColor="#fff"
              value={favoriteScene}
              onChangeText={setFavoriteScene}
              multiline
            />

            <Text style={styles.sectionTitle}>Frases favoritas</Text>
            {favoriteQuotes.map((quote, index) => (
              <TextInput
                key={index}
                style={styles.input}
                placeholder="Frase del libro"
                placeholderTextColor="#fff"
                value={quote}
                onChangeText={(text) => updateQuote(text, index)}
              />
            ))}
            <TouchableOpacity onPress={addQuote}>
              <Text style={styles.addMore}>+ Añadir frase</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Canción asociada</Text>
            <TextInput
              style={styles.input}
              placeholder="Canción que te recuerda al libro"
              placeholderTextColor="#fff"
              value={song}
              onChangeText={setSong}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveBook}>
              <Text style={styles.saveText}>Guardar libro</Text>
            </TouchableOpacity>

          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => { resetForm(); onClose(); }}>
      <View style={styles.overlay}>
        <ImageBackground
          source={require('../../assets/gui/libro_formulario.png')}
          style={styles.bookBase}
          resizeMode="contain"
        >
          <Text style={styles.mainTitle}>MI{"\n"}BOOK{"\n"}JOURNAL</Text>

          {renderContent()}

          {/* Modal de formato */}
          <Modal transparent visible={formatModal} animationType="fade">
            <View style={styles.selectorOverlay}>
              <View style={styles.selectorBox}>
                <TouchableOpacity style={styles.option} onPress={() => { setFormat("Físico");     setFormatModal(false); }}>
                  <Text style={styles.optionText}>Físico</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => { setFormat("Digital");    setFormatModal(false); }}>
                  <Text style={styles.optionText}>Digital</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => { setFormat("Audiolibro"); setFormatModal(false); }}>
                  <Text style={styles.optionText}>Audiolibro</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <TouchableOpacity style={styles.closeBtn} onPress={() => { resetForm(); onClose(); }}>
            <Image source={require('../../assets/gui/x_icono.png')} style={styles.closeIcon} />
          </TouchableOpacity>

          <View style={styles.footer}>
            {page > 1 && (
              <TouchableOpacity onPress={() => setPage(page - 1)}>
                <Image source={require('../../assets/gui/regresar_atras.png')} style={styles.navIcon} />
              </TouchableOpacity>
            )}
            {page < 4 && (
              <TouchableOpacity onPress={() => setPage(page + 1)}>
                <Image source={require('../../assets/gui/regresar.png')} style={styles.navIcon} />
              </TouchableOpacity>
            )}
          </View>

        </ImageBackground>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(244,243,243,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bookBase: {
    width: wp(170),
    height: hp(80),
    alignItems: 'center',
    paddingTop: hp(3),
  },

  mainTitle: {
    fontFamily: 'CuteLettering',
    top: -hp(7),
    fontSize: 35,
    textAlign: 'center',
    color: '#3d2b1f',
  },

  formContainer: {
    width: '40%',
    alignItems: 'center',
  },

  input: {
    fontFamily: 'AlmondMilky',
    backgroundColor: '#A3835E',
    top: -hp(2),
    height: 50,
    borderRadius: 25,
    marginBottom: 15,
    paddingHorizontal: 40,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },

  inputRating: {
    fontFamily: 'AlmondMilky',
    backgroundColor: '#A3835E',
    top: -hp(1),
    height: 50,
    borderRadius: 25,
    marginBottom: 15,
    paddingHorizontal: 40,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },

  addPhotoBtn: {
    backgroundColor: '#EADDCA',
    top: -hp(2),
    width: '100%',
    height: hp(17),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  coverPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },

  cameraIcon: {
    width: 55,
    height: 55,
    resizeMode: "contain",
  },

  formatBtn: {
    backgroundColor: '#A67B5B',
    top: -hp(2),
    width: '50%',
    borderRadius: 15,
    padding: 10,
    marginTop: 5,
  },

  btnText: {
    fontFamily: 'AlmondMilky',
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },

  ratingTitle: {
    fontFamily: "AlmondMilky",
    fontSize: 18,
    color: "#3d2b1f",
    marginBottom: 5,
  },

  sectionTitle: {
    fontFamily: "AlmondMilky",
    fontSize: 16,
    color: "#3d2b1f",
    top: -hp(2),
    marginTop: 14,
  },

  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    top: -hp(2),
    marginTop: 7,
  },

  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },

  star: {
    width: 40,
    height: 40,
    marginHorizontal: 6,
    resizeMode: "contain",
  },

  addMore: {
    fontFamily: "AlmondMilky",
    color: "#3d2b1f",
    textAlign: "center",
    top: -hp(2),
    marginBottom: 18,
  },

  calendarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 20,
  },

  calendarIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    alignSelf: "center",
  },

  calendarText: {
    fontFamily: "AlmondMilky",
    textAlign: "center",
    color: "#3d2b1f",
    marginTop: 4,
  },

  synopsisInput: {
    fontFamily: 'AlmondMilky',
    backgroundColor: '#A3835E',
    width: '100%',
    height: 110,
    borderRadius: 20,
    marginTop: 20,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '46%',
    position: 'absolute',
    bottom: hp(15),
  },

  navIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  selectorOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  selectorBox: {
    width: 200,
    backgroundColor: "#EADDCA",
    borderRadius: 15,
    padding: 15,
  },

  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#A67B5B",
  },

  optionText: {
    fontFamily: "AlmondMilky",
    fontSize: 16,
    textAlign: "center",
    color: "#3d2b1f",
  },

  bigInput: {
    fontFamily: 'AlmondMilky',
    backgroundColor: '#A3835E',
    height: 100,
    borderRadius: 20,
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingTop: 10,
    color: '#fff',
    fontSize: 16,
  },

  saveButton: {
    backgroundColor: '#5F3742',
    borderRadius: 20,
    padding: 15,
    marginTop: 20,
    marginBottom: 40,
  },

  saveText: {
    fontFamily: 'AlmondMilky',
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },

  closeBtn: {
    position: "absolute",
    top: hp(12),
    right: wp(40),
  },

  closeIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
});

export default BookFormModal;