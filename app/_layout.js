import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const PRIMARY_COLOR = '#643853';
const SECONDARY_COLOR = '#99627A';

// Custom header background component
const GradientHeader = () => (
  <LinearGradient
    colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={StyleSheet.absoluteFill}
  />
);
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{
        headerShown: false, statusBarStyle: 'dark'
      }} />
      <Stack.Screen name="request-access" options={{
        title: 'Request Access',
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.headerTitleStyle,
        headerTintColor: '#ffffff',
        statusBarStyle: 'dark',
        headerBackground: () => <GradientHeader />,
      }} />
      <Stack.Screen name="admin-dashboard" options={{
        headerShown: false, statusBarStyle: 'light',
        statusBarColor: '#643852'
      }} />
      <Stack.Screen name="user-dashboard" options={{
        headerShown: false,
        statusBarStyle: 'light',
        statusBarColor: '#643852'
      }} />
    </Stack>
  );
}
const styles = StyleSheet.create({
  headerStyle: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleStyle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});