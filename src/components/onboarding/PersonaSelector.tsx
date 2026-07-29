import React from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/context/AppStateContext';

const PERSONAS = [
  { name: 'Student', image: 'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/students.png' },
  { name: 'Work', image: 'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/work.png' },
  { name: 'Local', image: 'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/resident.png' },
  { name: 'Visitor', image: 'https://wfanbaefeuxczqxzqfdk.supabase.co/storage/v1/object/public/bar-photos/visit.png' },
];

interface Props {
  visible: boolean;
  onDone: () => void;
  dismissable?: boolean;
}

export function PersonaSelector({ visible, onDone, dismissable }: Props) {
  const { setUserPersona } = useAppState();

  const selectPersona = (persona: string) => {
    setUserPersona(persona);
    onDone();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={dismissable ? onDone : undefined}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>What Brings You To Town?</Text>
          {PERSONAS.map((p) => (
            <Pressable key={p.name} style={styles.option} onPress={() => selectPersona(p.name)}>
              <Image source={{ uri: p.image }} style={styles.optionImage} />
              <View style={styles.optionOverlay} />
              <Text style={styles.optionText}>{p.name}</Text>
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
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
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
