import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';

import BookFormModal from './BookFormModal';
import { deleteBook, getBookById } from '../../database/dbFunctions';

const { width, height } = Dimensions.get('window');
const wp = (p: number) => (width * p) / 100;
const hp = (p: number) => (height * p) / 100;

interface Props {
  visible: boolean;
  book: any;
  onClose: () => void;
  onRefresh: () => void;
}

const BookDetailModal: React.FC<Props> = ({ visible, book, onClose, onRefresh }) => {
  const [page, setPage] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [currentBook, setCurrentBook] = useState(book);

  const resetForm = () => {
    setPage(1);
  };

  useEffect(() => {
    if (book) setCurrentBook(book);
  }, [book]);

  if (!currentBook) return null;

  const renderStars = (arr: number[]) =>
    arr.map((val, i) => {
      let src;
      if (val === 0) src = require('../../assets/gui/estrella_vacia.png');
      else if (val === 1) src = require('../../assets/gui/estrella_media.png');
      else src = require('../../assets/gui/estrella_completa.png');
      return <Image key={i} source={src} style={styles.star} />;
    });

  const renderTears = (arr: number[]) =>
    arr.map((val, i) => {
      let src;
      if (val === 0) src = require('../../assets/gui/lagrima_vacia.png');
      else if (val === 1) src = require('../../assets/gui/lagrima_media.png');
      else src = require('../../assets/gui/lagrimas_llena.png');
      return <Image key={i} source={src} style={styles.star} />;
    });

  const renderSpicy = (arr: number[]) =>
    arr.map((val, i) => {
      let src;
      if (val === 0) src = require('../../assets/gui/chile_vacio.png');
      else if (val === 1) src = require('../../assets/gui/chile_medio.png');
      else src = require('../../assets/gui/chile_lleno.png');
      return <Image key={i} source={src} style={styles.star} />;
    });

  const renderContent = () => {
    switch (page) {

      case 1:
        return (
          <View style={styles.coverFullWrapper}>
            {currentBook.cover ? (
              <Image source={{ uri: currentBook.cover }} style={styles.coverFull} />
            ) : (
              <View style={styles.coverFullPlaceholder}>
                <Image source={require('../../assets/gui/lomo_libro.png')} style={styles.coverPlaceholderIcon} />
                <Text style={styles.coverPlaceholderText}>Sin portada</Text>
              </View>
            )}
          </View>
        );

      case 2: {
        // ✅ Parseo sin desfase UTC: se construye la fecha desde año/mes/día directamente
        const formatDate = (raw: any) => {
          if (!raw) return '—';
          const str = typeof raw === 'string' ? raw : String(raw);
          const datePart = str.split('T')[0];
          const parts = datePart.split('-').map(Number);
          if (parts.length < 3) return '—';
          const d = new Date(parts[0], parts[1] - 1, parts[2]);
          return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-MX');
        };

        return (
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <View style={styles.infoBox}>
              <Text style={styles.bigInfoLabel}>Titulo del libro</Text>
              <Text style={styles.infoText}>{currentBook.title || '—'}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.bigInfoLabel}>Autor/a</Text>
              <Text style={styles.infoText}>{currentBook.author || '—'}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.bigInfoLabel}>Genero</Text>
              <Text style={styles.infoText}>{currentBook.genre || '—'}</Text>
            </View>

            <View style={[styles.infoBox, styles.infoBoxSmall]}>
              <Text style={styles.bigInfoLabel}>Formato</Text>
              <Text style={styles.infoText}>{currentBook.format || '—'}</Text>
            </View>

            <Text style={styles.ratingTitle}>Calificación</Text>
            <View style={styles.starsContainer}>
              {renderStars(currentBook.stars || [0, 0, 0, 0, 0])}
            </View>

            <View style={styles.calendarContainer}>
              <View style={styles.dateBlock}>
                <Image source={require('../../assets/gui/calendario.png')} style={styles.calendarIcon} />
                <Text style={styles.calendarLabel}>Fecha de Inicio</Text>
                <Text style={styles.calendarText}>{formatDate(currentBook.startDate)}</Text>
              </View>
              <View style={styles.dateBlock}>
                <Image source={require('../../assets/gui/calendario.png')} style={styles.calendarIcon} />
                <Text style={styles.calendarLabel}>Fecha de Termino</Text>
                <Text style={styles.calendarText}>{formatDate(currentBook.endDate)}</Text>
              </View>
            </View>

            <View style={styles.synopsisBox}>
              <Text style={styles.synopsisText}>{currentBook.synopsis || 'Sin sinopsis'}</Text>
            </View>
          </ScrollView>
        );
      }

      case 3:
        return (
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Personaje/s Principal/es</Text>
            {(currentBook.mainCharacters || []).filter(Boolean).map((c: string, i: number) => (
              <View key={i} style={styles.infoBoxWide}><Text style={styles.infoText}>{c}</Text></View>
            ))}

            <Text style={styles.sectionTitle}>Personaje/s Favorito/S</Text>
            {(currentBook.favoriteCharacters || []).filter(Boolean).map((c: string, i: number) => (
              <View key={i} style={styles.infoBoxWide}><Text style={styles.infoText}>{c}</Text></View>
            ))}

            <Text style={styles.sectionTitle}>Personaje/s Más Odiado/S</Text>
            {(currentBook.hatedCharacters || []).filter(Boolean).map((c: string, i: number) => (
              <View key={i} style={styles.infoBoxWide}><Text style={styles.infoText}>{c}</Text></View>
            ))}

            <Text style={styles.sectionTitle}>Lagrimas Derramadas</Text>
            <View style={styles.ratingContainer}>
              {renderTears(currentBook.tears || [0, 0, 0, 0, 0])}
            </View>

            <Text style={styles.sectionTitle}>Nivel de Spicy</Text>
            <View style={styles.ratingContainer}>
              {renderSpicy(currentBook.spicy || [0, 0, 0, 0, 0])}
            </View>
          </ScrollView>
        );

      case 4:
        return (
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <View style={styles.bigInfoBox}>
              <Text style={styles.bigInfoLabel}>Escena Favorita</Text>
              <Text style={styles.bigInfoText}>{currentBook.favoriteScene || '—'}</Text>
            </View>

            <View style={styles.bigInfoBox}>
              <Text style={styles.bigInfoLabel}>Frase Favorita</Text>
              {(currentBook.favoriteQuotes || []).filter(Boolean).map((q: string, i: number) => (
                <Text key={i} style={styles.bigInfoText}>{`"${q}"`}</Text>
              ))}
            </View>

            <View style={styles.bigInfoBox}>
              <Text style={styles.bigInfoLabel}>Canción Asociada</Text>
              <Text style={styles.bigInfoText}>{currentBook.song || '—'}</Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={onClose}>
              <Text style={styles.saveText} onPress={() => { resetForm(); onClose(); }}>Cerrar Libro</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <ImageBackground
            source={require('../../assets/gui/libro_formulario.png')}
            style={styles.bookBase}
            resizeMode="contain"
          >
            <Text style={styles.mainTitle}>MI{'\n'}BOOK{'\n'}JOURNAL</Text>

            {renderContent()}

            <TouchableOpacity style={styles.closeBtn} onPress={() => { resetForm(); onClose(); }}>
              <Image source={require('../../assets/gui/x_icono.png')} style={styles.closeIcon} />
            </TouchableOpacity>

            <View style={styles.actionBar}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setEditMode(true)}>
                <Image source={require('../../assets/gui/lapiz.png')} style={styles.actionIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  Alert.alert('Eliminar', '¿Seguro que quieres eliminar este libro?', [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Sí, eliminar',
                      style: 'destructive',
                      onPress: () => { deleteBook(currentBook.id); onRefresh(); onClose(); },
                    },
                  ]);
                }}
              >
                <Image source={require('../../assets/gui/basura.png')} style={styles.actionIcon} />
              </TouchableOpacity>
            </View>

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

      {/* ✅ Al cerrar el editor recarga el libro desde la BD directamente */}
      <BookFormModal
        visible={editMode}
        book={currentBook}
        isEditing={true}
        onClose={() => {
          setEditMode(false);
          onRefresh();
          const updated = getBookById(currentBook.id);
          if (updated) setCurrentBook(updated);
        }}
      />
    </>
  );
};

export default BookDetailModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(244,243,243,0.5)', justifyContent: 'center', alignItems: 'center' },
  bookBase: { width: wp(170), height: hp(80), alignItems: 'center', paddingTop: hp(3) },
  mainTitle: { fontFamily: 'CuteLettering', top: -hp(7), fontSize: 35, textAlign: 'center', color: '#3d2b1f' },
  coverFullWrapper: { position: 'absolute', top: hp(15), right: wp(50), width: wp(70), height: hp(50), borderRadius: 12, overflow: 'hidden', backgroundColor: '#EADDCA' },
  coverFull: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverFullPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EADDCA' },
  formContainer: { width: '40%', alignItems: 'center', top: -hp(2) },
  coverPlaceholderIcon: { width: 55, height: 55, resizeMode: 'contain' },
  coverPlaceholderText: { fontFamily: 'AlmondMilky', color: '#A3835E', marginTop: 6, fontSize: 14 },
  infoBox: { backgroundColor: '#A3835E', width: '100%', minHeight: 46, borderRadius: 25, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  infoBoxSmall: { width: '55%', alignSelf: 'center' },
  infoBoxWide: { backgroundColor: '#A3835E', width: '100%', minHeight: 42, borderRadius: 25, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  infoText: { fontFamily: 'AlmondMilky', color: '#fff', fontSize: 15, textAlign: 'center' },
  ratingTitle: { fontFamily: 'AlmondMilky', fontSize: 18, color: '#3d2b1f', marginBottom: 6 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  star: { width: 38, height: 38, marginHorizontal: 4, resizeMode: 'contain' },
  calendarContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
  dateBlock: { alignItems: 'center', flex: 1 },
  calendarIcon: { width: 52, height: 52, resizeMode: 'contain' },
  calendarLabel: { fontFamily: 'AlmondMilky', fontSize: 11, color: '#3d2b1f', textAlign: 'center' },
  calendarText: { fontFamily: 'AlmondMilky', fontSize: 13, color: '#3d2b1f', textAlign: 'center', marginTop: 2 },
  synopsisBox: { backgroundColor: '#A3835E', width: '100%', minHeight: hp(11), borderRadius: 20, padding: 14, justifyContent: 'center' },
  synopsisText: { fontFamily: 'AlmondMilky', color: '#fff', fontSize: 14, textAlign: 'center' },
  scrollArea: { width: '40%', maxHeight: hp(50), top: -hp(2) },
  sectionTitle: { fontFamily: 'AlmondMilky', fontSize: 15, color: '#3d2b1f', marginTop: 14, marginBottom: 6 },
  ratingContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  bigInfoBox: { backgroundColor: '#A3835E', borderRadius: 20, padding: 14, marginBottom: 14, width: '100%' },
  bigInfoLabel: { fontFamily: 'AlmondMilky', color: '#EADDCA', fontSize: 15, marginBottom: 6, textAlign: 'center' },
  bigInfoText: { fontFamily: 'AlmondMilky', color: '#fff', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  saveButton: { backgroundColor: '#5F3742', borderRadius: 20, padding: 15, marginTop: 10, marginBottom: 40 },
  saveText: { fontFamily: 'AlmondMilky', color: '#fff', fontSize: 18, textAlign: 'center' },
  closeBtn: { position: 'absolute', top: hp(12), right: wp(40) },
  closeIcon: { width: 40, height: 40, resizeMode: 'contain' },
  actionBar: { position: 'absolute', top: hp(12), left: wp(40), flexDirection: 'column', gap: 10 },
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: 6 },
  actionBtnText: { fontSize: 20 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', width: '46%', position: 'absolute', bottom: hp(15) },
  actionIcon: { width: 32, height: 32, resizeMode: 'contain' },
  navIcon: { width: 50, height: 50, resizeMode: 'contain' },
});