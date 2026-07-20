import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AboutUs } from '@/components/AboutUs';
import { IconCity, IconInvader, IconUserCircle } from '@/components/Icons';
import { CitySelector } from '@/components/onboarding/CitySelector';
import { PersonaSelector } from '@/components/onboarding/PersonaSelector';
import { useAppState } from '@/context/AppStateContext';

const DRAWER_WIDTH = 280;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AppDrawer({ visible, onClose }: Props) {
  const { currentCity, userPersona } = useAppState();
  const [showCity, setShowCity] = useState(false);
  const [showPersona, setShowPersona] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [mounted, setMounted] = useState(false);

  const translateX = useSharedValue(-DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateX.value = withTiming(0, { duration: 250 });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!mounted) return (
    <>
      <CitySelector visible={showCity} onDone={() => setShowCity(false)} />
      <PersonaSelector visible={showPersona} onDone={() => setShowPersona(false)} />
      <AboutUs visible={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );

  return (
    <>
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Drawer */}
        <Animated.View style={[styles.drawer, drawerStyle]}>
          {/* Profile header - tap to close */}
          <Pressable style={styles.header} onPress={onClose}>
            <View style={styles.iconWrap}>
              <IconUserCircle size={20} color="#E1B12C" />
            </View>
            <Text style={styles.headerText}>Your Profile</Text>
          </Pressable>

          {/* City */}
          <Pressable
            style={styles.item}
            onPress={() => {
              onClose();
              setTimeout(() => setShowCity(true), 300);
            }}
          >
            <View style={styles.iconWrap}>
              <IconCity size={18} color="#E1B12C" />
            </View>
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
            <View style={styles.iconWrap}>
              <IconUserCircle size={18} color="#E1B12C" />
            </View>
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
            <View style={styles.iconWrap}>
              <IconInvader size={18} color="#E1B12C" />
            </View>
            <Text style={styles.itemText}>About Us</Text>
          </Pressable>
        </Animated.View>
      </View>

      <CitySelector visible={showCity} onDone={() => setShowCity(false)} />
      <PersonaSelector visible={showPersona} onDone={() => setShowPersona(false)} />
      <AboutUs visible={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingHorizontal: 16,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 4, height: 0 },
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
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
  iconWrap: {
    width: 28,
    marginRight: 12,
    alignItems: 'center',
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
