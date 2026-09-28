import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { CartProvider } from './src/context/CartContext';
import { OrdersProvider } from './src/context/OrdersContext'; // Question 10 Context

import LoginScreen from './src/screens/LoginScreen';
import MenuScreen from './src/screens/MenuScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CartScreen from './src/screens/CartScreen';
import OrderSummaryScreen from './src/screens/OrderSummaryScreen';
import ReservationScreen from './src/screens/ReservationScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import ManagerDashboardScreen from './src/screens/ManagerDashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <OrdersProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="MainTabs" component={MenuScreen} />
                <Stack.Screen name="Cart" component={CartScreen} />
                <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Reservation" component={ReservationScreen} />
                <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
                <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </OrdersProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}