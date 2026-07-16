import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  options: string[];
  activeFilters: Set<string>;
  onToggle: (filter: string) => void;
  onClearAll: () => void;
}

export function FilterPills({ options, activeFilters, onToggle, onClearAll }: Props) {
  if (options.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Filters</Text>
      <View style={styles.scrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeFilters.size > 0 && (
            <Pressable style={styles.clearPill} onPress={onClearAll}>
              <Text style={styles.clearText}>✕ Clear All</Text>
            </Pressable>
          )}
          {options.map((option) => {
            const isActive = activeFilters.has(option);
            return (
              <Pressable
                key={option}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => onToggle(option)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {/* Fade hint on right edge */}
        {Platform.OS === 'web' && (
          <View style={styles.fadeHint} pointerEvents="none" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  heading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    textTransform: 'uppercase' as any,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  scrollWrapper: {
    position: 'relative' as any,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingRight: 40,
    gap: 8,
  },
  fadeHint: {
    position: 'absolute' as any,
    top: 0,
    right: 0,
    bottom: 0,
    width: 32,
    // @ts-ignore web-only
    backgroundImage: 'linear-gradient(to right, transparent, rgba(255,255,255,0.9))',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pillActive: {
    backgroundColor: '#121212',
    borderColor: '#E1B12C',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  pillTextActive: {
    color: '#E1B12C',
    fontWeight: '600',
  },
  clearPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E1B12C',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#121212',
  },
});
