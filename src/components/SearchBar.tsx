import { Bar } from '@/lib/types';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
      </View>
      {searchText.length > 0 && (
        <View style={styles.searchDropdown}>
          {filteredBars.length === 0 ? (
            <Text style={styles.noResults}>No bars found</Text>
          ) : (
            filteredBars.map((bar) => (
              <Pressable key={bar.id} style={styles.searchItem} onPress={() => onSelectBar(bar)}>
                <Text style={styles.searchItemText}>{bar.name}</Text>
              </Pressable>
            ))
          )}
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
  searchDropdown: {
    position: 'absolute',
    top: 72,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 20,
  },
  searchItem: { paddingHorizontal: 16, paddingVertical: 12 },
  searchItemText: { fontSize: 16, color: '#15161E' },
  noResults: { padding: 16, color: '#606A85' },
});
