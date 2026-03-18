import React, { useState } from "react";
import { 
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView, ImageBackground, 
  KeyboardAvoidingView, Platform
} from "react-native";
import { useRouter } from 'expo-router';

export default function Ajustes() {
  const router = useRouter();
  const [autoMode,setAutoMode] = useState(false);
  const [backup,setBackup] = useState(false);

  return (
    <ImageBackground 
          source={require('../../assets/images/inicio.png')} 
          style={styles.background}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
          >

    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Ajustes</Text>

      {/* ICONO USUARIO */}

      <View style={styles.profileCircle}>
        <Image
          source={require("../../assets/gui/calendario.png")}
          style={styles.profileIcon}
        />
      </View>


      {/* MODO AUTOMATICO */}

      <View style={styles.optionRow}>

        <Text style={styles.optionText}>
          Modo automático (sensor de luz)
        </Text>

        <Switch
          value={autoMode}
          onValueChange={setAutoMode}
        />

      </View>


      {/* RESPALDO AUTOMATICO */}

      <View style={styles.optionRow}>

        <Text style={styles.optionText}>
          Respaldo automático
        </Text>

        <Switch
          value={backup}
          onValueChange={setBackup}
        />

      </View>

      <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push("/explore")}>
            <Image source={require('../../assets/gui/regresar_atras.png')} style={styles.navIcon} />
          </TouchableOpacity>
      </View>

      {/* BOTONES */}

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Exportar biblioteca
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Versión
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Soporte
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Políticas de privacidad
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Créditos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.footerLink}>
            Eliminar Cuenta
        </Text>
    </TouchableOpacity>
      

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
container:{
flexGrow:1,
alignItems:"center",
paddingTop:20
},

title:{
fontSize:40,
fontFamily:"CuteLettering",
color:"#3d2b1f",
marginBottom:20
},

profileCircle:{
width:130,
height:130,
borderRadius:60,
backgroundColor:"#EADDCA",
justifyContent:"center",
alignItems:"center",
marginBottom:30
},

profileIcon:{
width:70,
height:70,
resizeMode:"contain"
},

optionRow:{
width:"70%",
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginBottom:10
},

optionText:{
fontFamily:"AlmondMilky",
fontSize:16,
color:"#3D464A"
},

button:{
width:"80%",
backgroundColor:"#92A1A8",
padding:14,
borderRadius:20,
marginBottom:15
},

buttonText:{
fontFamily:"AlmondMilky",
color:"#fff",
textAlign:"center",
fontSize:16
},

footerLink: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'AlmondMilky',
    color: '#3D464A',
},

footer:{
    flexDirection:'row',
    justifyContent:'space-between',
    width:'102%',
    position:'absolute',
    bottom: (55 + 10),
  },

  navIcon:{ 
    width:50, 
    height:50, 
    resizeMode:'contain' 
  },

});
