import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [isSignup, setIsSignup] = useState(true); // Default active tab: Sign Up
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role: Customer
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, logout, loading } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isSignup) {
      if (!name) {
        Alert.alert('Error', 'Please enter your full name');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      try {
        await register(name, email, password, role);
        if (logout) {
          await logout();
        }
        Alert.alert(
          'Success',
          'Account created successfully! Please log in with your credentials.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsSignup(false); // Switch to Login Tab
                setPassword('');
                setConfirmPassword('');
              },
            },
          ]
        );
      } catch (err) {
        Alert.alert('Registration Failed', err.message || 'Something went wrong');
      }
    } else {
      try {
        const loggedInUser = await login(email, password);
        
        // Role-based Navigation Check
        if (loggedInUser && loggedInUser.role === 'manager') {
          navigation.navigate('ManagerDashboard');
        } else {
          navigation.navigate('MainTabs');
        }
      } catch (err) {
        Alert.alert('Login Failed', err.message || 'Something went wrong');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Top Header with Gear Circle Icon and Title */}
        <View style={styles.headerRow}>
          <View style={styles.gearCircleOuter}>
            <View style={styles.gearCircleInner}>
              <Text style={styles.gearIcon}>⚙</Text>
            </View>
          </View>
          <Text style={styles.titleText}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </Text>
        </View>

        {/* Segmented Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, !isSignup && styles.tabBtnActive]}
            onPress={() => setIsSignup(false)}
          >
            <Text style={[styles.tabText, !isSignup && styles.tabTextActiveLogin]}>
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, isSignup && styles.tabBtnActive]}
            onPress={() => setIsSignup(true)}
          >
            <Text style={[styles.tabText, isSignup && styles.tabTextActiveSignup]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Full Name Field (Sign Up Only) */}
        {isSignup && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="Zainab Farhan"
                placeholderTextColor="#A0A0A0"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
        )}

        {/* Email Address Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="zainab@test.com"
              placeholderTextColor="#A0A0A0"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Password Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password1"
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showBtnText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Field (Sign Up Only) */}
        {isSignup && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor="#A0A0A0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>
        )}

        {/* Account Role Selector (Sign Up Only) */}
        {isSignup && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Select Account Role</Text>
            <View style={styles.roleRow}>
              {/* Customer Role Button */}
              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  role === 'customer' ? styles.customerBtnActive : styles.roleBtnInactive,
                ]}
                onPress={() => setRole('customer')}
              >
                <Text
                  style={[
                    styles.roleText,
                    role === 'customer' ? styles.roleTextActive : styles.roleTextInactive,
                  ]}
                >
                  👤  Customer
                </Text>
              </TouchableOpacity>

              {/* Manager Role Button */}
              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  role === 'manager' ? styles.managerBtnActive : styles.roleBtnInactive,
                ]}
                onPress={() => setRole('manager')}
              >
                <Text
                  style={[
                    styles.roleText,
                    role === 'manager' ? styles.roleTextActive : styles.roleTextInactive,
                  ]}
                >
                  👔  Manager
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Main Action Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isSignup ? 'Register Account' : 'Log In'}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 30,
  },
  /* Header Section */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  gearCircleOuter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E2E4E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  gearCircleInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ADAFB4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearIcon: {
    fontSize: 26,
    color: '#FFFFFF',
  },
  titleText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  /* Segmented Control */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8EAEE',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#71757E',
  },
  tabTextActiveSignup: {
    color: '#DF5351',
    fontWeight: 'bold',
  },
  tabTextActiveLogin: {
    color: '#DF5351',
    fontWeight: 'bold',
  },
  /* Input Fields */
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2C30',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#D8DCE3',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    fontSize: 16,
    color: '#222222',
    width: '100%',
  },
  showBtnText: {
    color: '#DF5351',
    fontWeight: '700',
    fontSize: 15,
  },
  /* Role Selection */
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerBtnActive: {
    backgroundColor: '#DF5351',
  },
  managerBtnActive: {
    backgroundColor: '#DF5351',
  },
  roleBtnInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#D8DCE3',
  },
  roleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  roleTextInactive: {
    color: '#2A2C30',
  },
  /* Submit Button */
  submitBtn: {
    backgroundColor: '#DF5351',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});