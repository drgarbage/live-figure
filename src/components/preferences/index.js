import { Button, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import { PRESETS } from '../../assets/presets';

const pick = (key) => 
  PRESETS[key][Math.floor(Math.random() * PRESETS[key].length)];

const selected = (options, key) =>
  (key in PRESETS) ?
  PRESETS[key].map(item => item.prompt).indexOf(options.prompt) >= 0:
  false;

export const Preferences = ({options, setOptions}) => 
  <View style={{width: 300}}>
    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
      {Object.keys(PRESETS).map((key) => 
        <Button 
          color={selected(key, options) ? 'orange' : 'black'}
          key={key}
          title={key}
          onPress={() => setOptions(opt => ({...opt, ...(pick(key))}))}
          />
      )}
    </View>
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

    <Text 
      style={[styles.slider, {marginTop: 20, height: 120}]}
      numberOfLines={5}>{options?.prompt || ''}</Text>
  </View>


const styles = StyleSheet.create({
  fullWidth: {flex: 1, width: '100%' },
  slider: {
      width: '100%',
      height: 44,
      paddingLeft: 20,
      paddingRight: 20,
      alignItems: 'stretch',
      justifyContent: 'center',
  },
  sliderText: {

  },
  button: {},
});
