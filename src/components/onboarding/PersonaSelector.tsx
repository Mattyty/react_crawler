import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/context/AppStateContext';

const PERSONAS = [
  { name: 'Student', icon: '🎓' },
  { name: 'Work', icon: '💼' },
  { name: 'Local', icon: '🏠' },
  { name: 'Visitor', icon: '🍺' },
];

interface Props {
  visible: boolean;
  onDone: () => void;
}

export function PersonaSelector({ visible, onDone }: Props) {
  const { setUserPersona } = useAppState();

  const selectPersona = (persona: string) => {
    setUserPersona(persona);
    onDone();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Customize Your Feed.{'\n'}What Brings You To Town?</Text>
          {PERSONAS.map((p) => (
            <Pressable key={p.name} style={styles.option} onPress={() => selectPersona(p.name)}>
              <Text style={styles.icon}>{p.icon}</Text>
              <Text style={styles.optionText}>{p.name}</Text>
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
  icon: {
    fontSize: 20,
    marginRight: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
