import { Bar } from '@/lib/types';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
  searchText: string;
  onChangeText: (text: string) => void;
  filteredBars: Bar[];
  onSelectBar: (bar: Bar) => void;
}

export function SearchBar({ searchText, onChangeText, filteredBars, onSelectBar }: Props) {
  return (
    <View style={styles.searchWrapper}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>⚲</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Bars"
          placeholderTextColor="#606A85"
          value={searchText}
          onChangeText={onChangeText}
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <Text style={styles.clearIcon}>✕</Text>
          </Pressable>
        )}
      </View>
      {searchText.length > 0 && (
        <View style={styles.searchDropdown}>
          <ScrollView keyboardShouldPersistTaps="handled" style={styles.dropdownScroll}>
            {filteredBars.length === 0 ? (
              <View style={styles.noResultsRow}>
                <Text style={styles.noResults}>No matches</Text>
              </View>
            ) : (
              filteredBars.map((bar, index) => (
                <Pressable
                  key={bar.id}
                  style={[
                    styles.searchItem,
                    index < filteredBars.length - 1 && styles.searchItemBorder,
                  ]}
                  onPress={() => onSelectBar(bar)}
                >
                  <Text style={styles.searchItemText}>{bar.name}</Text>
                  {bar.address && (
                    <Text style={styles.searchItemAddress} numberOfLines={1}>{bar.address}</Text>
                  )}
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrapper: { paddingHorizontal: 16, paddingTop: 16, zIndex: 10, backgroundColor: '#fff' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 40,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8, color: '#15161E', fontWeight: '700' },
  searchInput: { flex: 1, fontSize: 14, color: '#15161E' },
  clearIcon: { fontSize: 14, color: '#9CA3AF', paddingLeft: 8 },
  searchDropdown: {
    position: 'absolute',
    top: 72,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 240,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 20,
    overflow: 'hidden',
  },
  dropdownScroll: { maxHeight: 240 },
  searchItem: { paddingHorizontal: 16, paddingVertical: 12 },
  searchItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  searchItemText: { fontSize: 15, fontWeight: '600', color: '#15161E' },
  searchItemAddress: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  noResultsRow: { paddingHorizontal: 16, paddingVertical: 16 },
  noResults: { fontSize: 14, color: '#606A85' },
});
