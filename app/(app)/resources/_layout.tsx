
import { Stack } from 'expo-router';

export default function ResourcesLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false // Hide header on the main explore screen
        }} 
      />
      <Stack.Screen
        name='[id]'
        options={{
          headerShown: false, // Show header on the detail screen
          title: 'Resources Detail', // Set the title for the detail screen
        }}
      />
    </Stack>
    );
}