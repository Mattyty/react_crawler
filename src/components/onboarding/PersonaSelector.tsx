import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { IconBriefcase, IconCamera, IconGraduation, IconHome } from '@/components/Icons';
import { useAppState } from '@/context/AppStateContext';

const PERSONAS = [
  { name: 'Student', icon: <IconGraduation size={22} color="#121212" /> },
  { name: 'Work', icon: <IconBriefcase size={22} color="#121212" /> },
  { name: 'Local', icon: <IconHome size={22} color="#121212" /> },
  { name: 'Visitor', icon: <IconCamera size={22} color="#121212" /> },
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
              <View style={styles.iconWrap}>{p.icon}</View>
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
