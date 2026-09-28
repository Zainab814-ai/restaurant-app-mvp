import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from '../hooks/useForm';
import { mockUsers } from '../data/users';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const authContext = useAuth ? useAuth() : null;
  const login = authContext?.login || (() => {});

  const [isSignup, setIsSignup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (formValues) => {
    let errs = {};
    const emailRegex = /\S+@\S+\.\S+/;
    if (!formValues.email) {
      errs.email = 'Email is required';
    } else if (!emailRegex.test(formValues.email)) {
      errs.email = 'Invalid email address format';
    }

    if (!formValues.password) {
      errs.password = 'Password is required';
    } else if (formValues.password.length < 8 || !/\d/.test(formValues.password)) {
      errs.password = 'Password must be at least 8 characters with at least 1 digit';
    }

    if (isSignup) {
      if (!formValues.name) errs.name = 'Full name is required';
      if (formValues.password !== formValues.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
    }

    return errs;
  };

  const initialValues = {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'customer', // Default role
  };

  const { values, errors, handleChange, handleSubmit, resetForm } = useForm(
    initialValues,
    validate
  );

  const toggleMode = () => {
    setIsSignup(!isSignup);
    resetForm(initialValues);
  };

  const handleAuthSubmit = (formData) => {
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      if (isSignup) {
        const newUser = {
          id: `user-${Date.now()}`,
          name: formData.name,
          email: formData.email.toLowerCase(),
          password: formData.password,
          role: formData.role || 'customer',
        };
        mockUsers.push(newUser);

        Alert.alert('Success 🎉', `Account created as ${newUser.role.toUpperCase()}! You can now log in.`);
        setIsSignup(false);
        resetForm({ ...initialValues, email: formData.email });
      } else {
        const user = mockUsers.find(
          (u) =>
            u.email.toLowerCase() === formData.email.toLowerCase() &&
            u.password === formData.password
        );

        if (user) {
          if (login) login(user);
          navigation.reset({
            index: 0,
            routes: [{ name: user.role === 'manager' ? 'ManagerDashboard' : 'MainTabs' }],
          });
        } else {
          Alert.alert('Authentication Failed', 'Invalid email or password credentials.');
        }
      }
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{isSignup ? 'Create Account' : 'Welcome Back'}</Text>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isSignup && styles.activeToggle]}
            onPress={() => isSignup && toggleMode()}
          >
            <Text style={[styles.toggleText, !isSignup && styles.activeToggleText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isSignup && styles.activeToggle]}
            onPress={() => !isSignup && toggleMode()}
          >
            <Text style={[styles.toggleText, isSignup && styles.activeToggleText]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {isSignup && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Zainab Farhan"
              value={values.name}
              onChangeText={(text) => handleChange('name', text)}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="zainab@test.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={values.email}
            onChangeText={(text) => handleChange('email', text)}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password1"
              secureTextEntry={!showPassword}
              value={values.password}
              onChangeText={(text) => handleChange('password', text)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showBtn}>
              <Text style={styles.showBtnText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {isSignup && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              secureTextEntry={!showPassword}
              value={values.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>
        )}

        {/* Explicit Role Selection Options in Sign Up */}
        {isSignup && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Account Role</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  values.role === 'customer' && styles.activeRoleBtn,
                ]}
                onPress={() => handleChange('role', 'customer')}
              >
                <Text
                  style={[
                    styles.roleText,
                    values.role === 'customer' && styles.activeRoleText,
                  ]}
                >
                  👤 Customer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  values.role === 'manager' && styles.activeRoleBtn,
                ]}
                onPress={() => handleChange('role', 'manager')}
              >
                <Text
                  style={[
                    styles.roleText,
                    values.role === 'manager' && styles.activeRoleText,
                  ]}
                >
                  👔 Manager
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.disabledBtn]}
          onPress={() => handleSubmit(handleAuthSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>{isSignup ? 'Register Account' : 'Log In'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContainer: { padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#E9ECEF', borderRadius: 8, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  activeToggle: { backgroundColor: '#FFFFFF' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#6C757D' },
  activeToggleText: { color: '#D9534F' },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#343A40', marginBottom: 6 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CED4DA', borderRadius: 8, padding: 10, fontSize: 15 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center' },
  showBtn: { position: 'absolute', right: 12 },
  showBtnText: { color: '#D9534F', fontWeight: '600' },
  errorText: { color: '#DC3545', fontSize: 11, marginTop: 2 },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleBtn: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: '#CED4DA', borderRadius: 8, alignItems: 'center', backgroundColor: '#FFF' },
  activeRoleBtn: { backgroundColor: '#D9534F', borderColor: '#D9534F' },
  roleText: { fontSize: 14, fontWeight: 'bold', color: '#495057' },
  activeRoleText: { color: '#FFFFFF' },
  submitBtn: { backgroundColor: '#D9534F', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  disabledBtn: { backgroundColor: '#E0A8A5' },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});