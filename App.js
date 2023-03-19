import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Preferences } from './src/components/preferences';
import { AntDesign } from '@expo/vector-icons';
import ImageView from "react-native-image-viewing";
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

import { IMG_BASE_SIZE } from 'constants';
import { DARK_PRESETS, PRESETS } from 'assets/presets';
import { img2img, upscale } from 'apis';
import { aspectFill as resizer, removeExifRotation, prefixPng, prefixJpg } from 'utils';

const depthMask = ({model, cut}) => 
  (model >= 0 && model <= 2) ?
  ({
    "script_name": "Depth aware img2img mask",
    "script_args": [
        false, 
        cut,  // 0 ~ 255
        true, 384, 384, false,
        model, // 0, 1, 2
        true, true, false, false
    ],
  }) : {};

const pick = () => 
  DARK_PRESETS[Math.floor(Math.random() * DARK_PRESETS.length)];

export default function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [results, setResults] = useState([]);
  const [host, setHost] = useState('http://dev.printii.com:7860');
  const [loading, setLoading] = useState(false);
  const [enlarge, setEnlarge] = useState(false);
  const [showPreference, setShowPreference] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showViewerbar, setShowViewerbar] = useState(true);
  const [options, setOptions] = useState({
    ...PRESETS.COS[0],
    denoising_strength: 0.42,
    cfg_scale: 8.5,
    width: IMG_BASE_SIZE,
    height: IMG_BASE_SIZE,
  });
  const [depthMaskOption, setDepthMaskOption] = useState({model: -1, cut: 0});

  const config = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    if(status !== 'granted') return alert("Camera access not allowed.");
    setShowScanner(v => !v);
  }

  const barcodeScanned = ({type, data}) => {
    if(!data.startsWith('http')) return;
    setHost(data);
    setShowScanner(false);
  }

  const capture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if(!permission.granted) return alert('Camera access not allowed.');

    const captureResult = await ImagePicker.launchCameraAsync({
      base64: true
    });

    if(captureResult.canceled) return;

    const asset = captureResult.assets[0];
    const size = resizer(asset.width, asset.height);
    setOptions(opt => ({...opt, ...size}));
    setImage(asset.base64);
  }

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(!permission.granted) return alert('Image access not allowed.');

    const pickResult = await ImagePicker.launchImageLibraryAsync({
      base64: true
    });

    if(pickResult.canceled) return;

    const asset = pickResult.assets[0];
    const size = resizer(asset.width, asset.height);
    const base64 = await removeExifRotation(prefixPng(asset.base64));
    setOptions(opt => ({...opt, ...size}));
    setImage(base64);
  }

  const share = async () => {
    if(!result) return;
    try {

      const uri = FileSystem.cacheDirectory + 'sharing.png';
      await FileSystem.writeAsStringAsync(uri, result, { encoding: FileSystem.EncodingType.Base64 });
      Sharing.shareAsync(uri, { UTI: 'public.jpeg', mimeType: 'image/png' });

    } catch (err) {

      alert(err);

    }
  }

  const save = async () => {
    if(!result) return;

    try {

      const permission = MediaLibrary.isAvailableAsync();

      if(!permission)
        return alert('Photo library not available.');
  
      let album = await MediaLibrary.getAlbumAsync("Live Figure");
  
      if(!album)
        album = await MediaLibrary.createAlbumAsync("Live Figure", asset, false);
  
      const uri = FileSystem.cacheDirectory + 'generated.png';
      await FileSystem.writeAsStringAsync(uri, result, { encoding: FileSystem.EncodingType.Base64 });
      const asset = await MediaLibrary.createAssetAsync(uri);
      MediaLibrary.addAssetsToAlbumAsync([asset.id], album, false);
      
      alert('Photo Saved');

    } catch (err) {
      alert(err);
    }
  }

  const reload = async () => {
    if(!image || image.length == 0) return;
    try{
      setLoading(true);
      const sdResult = await img2img(
        prefixPng(image), {
          ...options, 
          ...depthMask(depthMaskOption)
        }, host);
      setResult(sdResult[0]);
      setResults(sdResult);
      setEnlarge(true);
    }catch(err){
      alert(err);
      console.error(err);
    }finally{
      setLoading(false);
    }
  }

  const onUpscale = async () => {
    if(!image || image.length == 0) return;
    // if(!result || result.length == 0) return;
    try{
      setLoading(true);
      const usResult = await upscale(prefixJpg(image), {}. host);
      setResult(usResult);
      setEnlarge(true);
    }catch(err){
      console.error(err.name, err.message, err.stack);
      alert(err);
    }finally{
      setLoading(false);
    }
  }

  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {showScanner &&
        <BarCodeScanner
          onBarCodeScanned={barcodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      }

      { !!host && 
        <TouchableOpacity 
          onPress={() => setEnlarge(true)}
          style={styles.image}>
          <Image 
            source={{uri: prefixPng(image)}} 
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

      { showPreference && 
        <>
          <Preferences 
            options={options} 
            setOptions={setOptions} 
            depthMaskOption={depthMaskOption}
            setDepthMaskOption={setDepthMaskOption}
            onUpscale={onUpscale}
            />
          <AntDesign 
            style={{position: 'absolute', left: 20, top: 80 }}
            name="qrcode" 
            size={24} 
            color="silver" 
            onPress={config} />
          <AntDesign
            style={{position: 'absolute', left: 20, top: 120 }}
            name="warning" 
            size={24} 
            color="silver" 
            onPress={() => setOptions(opt => ({...opt, ...pick()}))} />
        </>
      }

      <View style={styles.toolbar}>
        <AntDesign name="setting" size={24} color="black" onPress={() => setShowPreference(v => !v)} />
        <AntDesign name="picture" size={24} color="black" onPress={pickImage} />
        <AntDesign name="camerao" size={44} color="black" onPress={capture} />
        <Button style={{flex: 1}} title='GENERATE' color="black" onPress={reload} />
        <AntDesign name="check" size={24} color="black"  onPress={() => setImage(result)} />
      </View>

      <ImageView 
        doubleTapToZoomEnabled
        visible={enlarge}
        onRequestClose={()=>setEnlarge(false)}
        onPress={()=>setShowViewerbar(v => !v)}
        images={results.map(item => ({uri: prefixPng(item)}))} 
        style={{width: 300, height: 300, alignItems: 'center', justifyContent: 'center' }} 
        FooterComponent={() =>
          <View style={styles.viewerbar}>
            <AntDesign 
              style={{marginRight: 20, display: showViewerbar ? 'flex' : 'none'}}
              name="sharealt" 
              size={24} 
              color="white" 
              onPress={share} />
            <AntDesign
              style={{marginRight: 20, display: showViewerbar ? 'flex' : 'none'}}
              name="download" 
              size={24} 
              color="white" 
              onPress={save} />
          </View>
        }
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
    backgroundColor: 'black',
  },
  toolbar: {
    width: '100%',
    height: 44,
    backgroundColor: 'wthie',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewerbar: {
    height: 44,
    marginBottom: 22,
    flexDirection: 'row-reverse',
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
