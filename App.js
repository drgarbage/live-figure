import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { img2img } from './src/api';
import { Slider } from '@miblanchard/react-native-slider';
import * as ImagePicker from 'expo-image-picker';
import ImageView from "react-native-image-viewing";

export default function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [host, setHost] = useState('https://50cb5f29-178c-4061.gradio.live');
  const [options, setOptions] = useState({
    denoising_strength: 0.42,
    cfg_scale: 8.5,
    width: 768,
    height: 768,
  })
  const [loading, setLoading] = useState(false);
  const [enlarge, setEnlarge] = useState(false);

  const config = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    if(status !== 'granted') return alert("Camera access not allowed.");
    setHost(null);
  }

  const barcodeScanned = ({type, data}) => {
    if(!data.startsWith('https://') || !data.endsWith('.gradio.live')) return;
    setHost(data);
  }

  const capture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if(!permission.granted) return alert('Camera access not allowed.');

    const captureResult = await ImagePicker.launchCameraAsync({
      base64: true
    });

    if(captureResult.canceled) return;
    const asset = captureResult.assets[0];
    const rate = Math.min(768 / asset.width, 768 / asset.height);
    const size = { width: parseInt(asset.width * rate), height: parseInt(asset.height * rate)};
    setOptions(opt => ({...opt, ...size}));
    setImage('data:image/jpeg;base64,' + asset.base64);
  }

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(!permission.granted) return alert('Image access not allowed.');

    const pickResult = await ImagePicker.launchImageLibraryAsync({
      base64: true
    });

    if(pickResult.canceled) return;
    const asset = pickResult.assets[0];
    const rate = Math.min(768 / asset.width, 768 / asset.height);
    const size = { width: parseInt(asset.width * rate), height: parseInt(asset.height * rate)};
    setOptions(opt => ({...opt, ...size}));
    setImage('data:image/jpeg;base64,' + asset.base64);
  }

  const reload = async () => {
    if(!image || image.length == 0) return;
    try{
      setLoading(true);
      const sdResult = await img2img(image, options, host);
      setResult('data:image/jpeg;base64,' + sdResult);
      setEnlarge(true);
    }catch(err){
      alert(err);
      console.error(err);
    }finally{
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {!host &&
        <BarCodeScanner
          onBarCodeScanned={barcodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      }

      { !!host && 
        <TouchableOpacity 
          onPress={()=>setEnlarge(true)}
          style={styles.image}>
          <Image 
            source={{uri:image}} 
            style={styles.image} 
            resizeMode='contain'
            />
        </TouchableOpacity>
      }

      { loading && 
        <ActivityIndicator 
          animating={loading} 
          size="large" 
          style={styles.loading} 
          color="white"
          />
      }
      
      <View style={styles.slider}>
        <Slider
          style={styles.fullWidth}
          value={options.cfg_scale}
          maximumValue={30}
          minimumValue={1}
          step={.5}
          onValueChange={([cfg_scale]) => setOptions(opt => ({...opt, cfg_scale}))}
        />
        <Text style={styles.sliderText}>{options.cfg_scale}</Text>
      </View>
      <View style={styles.slider}>
        <Slider
          style={styles.slider}
          value={options.denoising_strength}
          maximumValue={1}
          minimumValue={0}
          step={.01}
          onValueChange={([denoising_strength]) => setOptions(opt => ({...opt, denoising_strength}))}
        />
        <Text style={styles.sliderText}>{options.denoising_strength}</Text>
      </View>

      <View style={styles.toolbar}>
        <Button title='H' onPress={config} />
        <Button title='PHOTO' onPress={pickImage} />
        <Button title='CAM' onPress={capture} />
        <Button title='RELOAD' onPress={reload} />
      </View>

      <ImageView 
        doubleTapToZoomEnabled
        visible={enlarge}
        onRequestClose={()=>setEnlarge(false)}
        images={[{uri: result}]} 
        style={{width: 300, height: 300, alignItems: 'center', justifyContent: 'center' }} 
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
  fullWidth: {flex: 1, width: '100%' },
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
  },
  slider: {
      width: '100%',
      height: 44,
      paddingLeft: 20,
      paddingRight: 20,
      alignItems: 'stretch',
      justifyContent: 'center',
  },
  sliderText: {

  }
});
