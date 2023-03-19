import { Button, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import { PRESETS } from '../../assets/presets';

const pick = (key) => 
  PRESETS[key][Math.floor(Math.random() * PRESETS[key].length)];

const selected = (options, key) =>
  (key in PRESETS) ?
  PRESETS[key].map(item => item.prompt).indexOf(options.prompt) >= 0:
  false;

const DEPTHS = {
  '-1': 'none',
  '0' : 'deep',
  '1' : 'middle',
  '2' : 'small',
};

export const Preferences = ({
  options, setOptions, 
  depthMaskOption, setDepthMaskOption,
  onUpscale
}) => 
  <View style={styles.container}>
    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
      {Object.keys(PRESETS).map((key) => 
        <Button 
          color={selected(key, options) ? 'orange' : 'black'}
          key={key}
          title={key}
          onPress={() => setOptions(opt => ({...opt, ...(pick(key))}))}
          />
      )}
      <Button 
        key="UP"
        title="UP"
        onPress={onUpscale}
        />
    </View>
    <View style={styles.block}>
      <Slider
        style={styles.slider}
        value={options.cfg_scale}
        maximumValue={30}
        minimumValue={1}
        step={.5}
        onValueChange={([cfg_scale]) => setOptions(opt => ({...opt, cfg_scale}))}
      />
      <Text style={styles.sliderText}>{`details ${options.cfg_scale}`}</Text>
    </View>
    <View style={styles.block}>
      <Slider
        style={styles.slider}
        value={options.denoising_strength}
        maximumValue={1}
        minimumValue={0}
        step={.01}
        onValueChange={([denoising_strength]) => setOptions(opt => ({...opt, denoising_strength}))}
      />
      <Text style={styles.sliderText}>{`differ ${options.denoising_strength}`}</Text>
    </View>
    <View style={styles.block}>
      <Slider
        style={styles.slider}
        value={depthMaskOption.model}
        maximumValue={2}
        minimumValue={-1}
        step={1}
        onValueChange={([model]) => setDepthMaskOption(opt => ({...opt, model}))}
      />
      <Text style={styles.sliderText}>{`mask with ${DEPTHS[depthMaskOption.model]}`}</Text>
    </View>
    <View style={styles.block}>
      <Slider
        style={styles.slider}
        value={depthMaskOption.cut}
        maximumValue={255}
        minimumValue={0}
        step={1}
        onValueChange={([cut]) => setDepthMaskOption(opt => ({...opt, cut}))}
      />
      <Text style={styles.sliderText}>{`cut at ${depthMaskOption.cut}`}</Text>
    </View>

    <Text 
      style={[styles.slider, {marginTop: 20, height: 120}]}
      numberOfLines={5}>{options?.prompt || ''}</Text>
  </View>


const styles = StyleSheet.create({
  fullWidth: {flex: 1, width: '100%' },
  container: {
    paddingHorizontal: 20,
  },
  block: {
  },
  slider: {
  },
  sliderText: {
  },
  button: {},
});
