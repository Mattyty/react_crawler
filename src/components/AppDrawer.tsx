import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/context/AppStateContext';
import { AboutUs } from '@/components/AboutUs';
import { CitySelector } from '@/components/onboarding/CitySelector';
import { PersonaSelector } from '@/components/onboarding/PersonaSelector';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AppDrawer({ visible, onClose }: Props) {
  const { currentCity, userPersona } = useAppState();
  const [showCity, setShowCity] = useState(false);
  const [showPersona, setShowPersona] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.drawer}>
            <View style={styles.header}>
              <Text style={styles.headerIcon}>👤</Text>
              <Text style={styles.headerText}>Your Profile</Text>
            </View>

            {/* Home */}
            <Pressable style={styles.item} onPress={onClose}>
              <Text style={styles.icon}>🏠</Text>
              <Text style={styles.itemText}>Home</Text>
            </Pressable>

            {/* City */}
            <Pressable
              style={styles.item}
              onPress={() => {
                onClose();
                setTimeout(() => setShowCity(true), 300);
              }}
            >
              <Text style={styles.icon}>📍</Text>
              <Text style={styles.itemText}>City: </Text>
              <Text style={styles.itemValue}>{currentCity || 'Manchester'}</Text>
            </Pressable>

            {/* Persona */}
            <Pressable
              style={styles.item}
              onPress={() => {
                onClose();
                setTimeout(() => setShowPersona(true), 300);
              }}
            >
              <Text style={styles.icon}>👤</Text>
              <Text style={styles.itemText}>Profile: </Text>
              <Text style={styles.itemValue}>{userPersona || 'Student'}</Text>
            </Pressable>

            {/* About Us */}
            <Pressable
              style={styles.item}
              onPress={() => {
                onClose();
                setTimeout(() => setShowAbout(true), 300);
              }}
            >
              <Text style={styles.icon}>👋</Text>
              <Text style={styles.itemText}>About Us</Text>
            </Pressable>
          </View>

          {/* Tap outside to close */}
          <Pressable style={styles.closeArea} onPress={onClose} />
        </View>
      </Modal>

      <CitySelector visible={showCity} onDone={() => setShowCity(false)} />
      <PersonaSelector visible={showPersona} onDone={() => setShowPersona(false)} />
      <AboutUs visible={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    width: 280,
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  closeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 18,
    marginRight: 16,
  },
  itemText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  itemValue: {
    color: '#E1B12C',
    fontSize: 18,
    fontWeight: '500',
  },
});
