import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AboutUs({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Hi There!</Text>
          <Text style={styles.body}>
            {'\n'}Crawler was built with one simple mission: to give you the ultimate, FREE
            happy hour finder right in your pocket.{'\n\n'}We cut through the noise to bring you
            real-time, verified drink offers exactly when and where you need them, so you never miss
            a bargain when you're out in the city.{'\n\n'}If you would like your bar featured, or
            would like to get in touch, please contact us at:{'\n'}[Insert Email Here]
          </Text>
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
    backgroundColor: '#E1B12C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    minHeight: '50%',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
});
