import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false // Hide header on the main explore screen
        }}
      />
      <Stack.Screen 
        name="edit" 
        options={{ 
          headerShown: false // Hide header on the main explore screen
        }} 
      />
    </Stack>
    );
}