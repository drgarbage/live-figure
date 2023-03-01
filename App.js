import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { img2img } from './src/api';
import * as ImagePicker from 'expo-image-picker';
import ImageView from "react-native-image-viewing";

export default function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [options, setOptions] = useState({
    denoising_strength: 0.48,
    cfg_scale: 8.5,
  })
  const [loading, setLoading] = useState(false);
  const [enlarge, setEnlarge] = useState(false);

  const capture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if(!permission.granted) return alert('Camera access not allowed.');

    const captureResult = await ImagePicker.launchCameraAsync({
      base64: true,
      allowsEditing: true,
      aspect: [1,1],
      quality: 1
    });

    if(captureResult.canceled) return;
    setImage('data:image/jpeg;base64,' + captureResult.assets[0].base64);
  }

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(!permission.granted) return alert('Image access not allowed.');

    const pickResult = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    });

    if(pickResult.canceled) return;
    setImage('data:image/jpeg;base64,' + pickResult.assets[0].base64);
  }

  const reload = async () => {
    if(!image || image.length == 0) return;
    try{
      setLoading(true);
      const sdResult = await img2img(image, options);
      setResult('data:image/jpeg;base64,' + sdResult);
      setEnlarge(true);
    }catch(err){
      alert(err);
      console.log(err);
    }finally{
      setLoading(false);
    }
  }

  useEffect(() => { reload() }, [image, options]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <TouchableOpacity 
        onPress={()=>setEnlarge(true)}
        style={styles.image}>
        <Image 
          source={{uri:image}} 
          style={styles.image} 
          resizeMode='contain'
          />
      </TouchableOpacity>
      <View style={styles.toolbar}>
        <Button title='Camera' onPress={capture} />
        <Button title='Photos' onPress={pickImage} />
        <Button title='Reload' onPress={reload} />
      </View>
      <ImageView 
        visible={enlarge}
        onRequestClose={()=>setEnlarge(false)}
        images={[{uri: result}]} 
        style={{width: 300, height: 300, alignItems: 'center', justifyContent: 'center' }} 
        />
      <ActivityIndicator 
        animating={loading} 
        size="large" 
        style={styles.loading} 
        color="white"
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: { flex: 1 },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  toolbar: {
    flexDirection: 'row',
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
