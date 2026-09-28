import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>User Profile</Text>

      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.subText }]}>Name:</Text>
        <Text style={[styles.value, { color: theme.text }]}>{user?.name || 'N/A'}</Text>

        <Text style={[styles.label, { color: theme.subText }]}>Email:</Text>
        <Text style={[styles.value, { color: theme.text }]}>{user?.email || 'N/A'}</Text>

        <Text style={[styles.label, { color: theme.subText }]}>Role:</Text>
        <Text style={[styles.value, { color: theme.text }]}>{user?.role || 'N/A'}</Text>
      </View>

      <View style={[styles.switchRow, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.switchLabel, { color: theme.text }]}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>

      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.primary }]} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 16, borderRadius: 10, borderWidth: 1, marginBottom: 20 },
  label: { fontSize: 12, marginTop: 8 },
  value: { fontSize: 16, fontWeight: 'bold' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 10, borderWidth: 1, marginBottom: 20 },
  switchLabel: { fontSize: 16, fontWeight: '600' },
  logoutBtn: { padding: 14, borderRadius: 8, alignItems: 'center' },
  logoutBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});