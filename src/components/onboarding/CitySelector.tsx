import React from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/context/AppStateContext';

const CITIES = [
  { name: 'Manchester', image: 'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/mcr.png' },
  { name: 'Liverpool', image: 'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/liverpool.png' },
];

interface Props {
  visible: boolean;
  onDone: () => void;
  dismissable?: boolean;
}

export function CitySelector({ visible, onDone, dismissable }: Props) {
  const { setCurrentCity } = useAppState();

  const selectCity = (city: string) => {
    setCurrentCity(city);
    onDone();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={dismissable ? onDone : undefined}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>Select Your City:</Text>
          {CITIES.map((city) => (
            <Pressable key={city.name} style={styles.option} onPress={() => selectCity(city.name)}>
              <Image source={{ uri: city.image }} style={styles.optionImage} />
              <View style={styles.optionOverlay} />
              <Text style={styles.optionText}>{city.name}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 40,
    minHeight: '50%',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 24,
    color: '#E1B12C',
  },
  option: {
    height: 80,
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative' as any,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    borderWidth: 1,
    borderColor: '#E1B12C',
  },
  optionImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover' as any,
  },
  optionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  optionText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#E1B12C',
    letterSpacing: 1.5,
  },
});
