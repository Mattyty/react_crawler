import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { IconCity, IconShip } from '@/components/Icons';
import { useAppState } from '@/context/AppStateContext';

const CITIES = [
  { name: 'Manchester', icon: <IconCity size={22} color="#121212" /> },
  { name: 'Liverpool', icon: <IconShip size={22} color="#121212" /> },
];

interface Props {
  visible: boolean;
  onDone: () => void;
}

export function CitySelector({ visible, onDone }: Props) {
  const { setCurrentCity } = useAppState();

  const selectCity = (city: string) => {
    setCurrentCity(city);
    onDone();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Select Your City:</Text>
          {CITIES.map((city) => (
            <Pressable key={city.name} style={styles.option} onPress={() => selectCity(city.name)}>
              <View style={styles.iconWrap}>{city.icon}</View>
              <Text style={styles.optionText}>{city.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 12,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E2E2',
    height: 55,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  iconWrap: {
    width: 28,
    marginRight: 12,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
