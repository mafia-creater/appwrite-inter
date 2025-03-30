import { Stack } from 'expo-router';

export default function EventsLayout() {
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
          title: 'Events Detail', // Set the title for the detail screen
        }}
      />
      <Stack.Screen
        name='create'
        options={{
          headerShown: false, // Show header on the create screen
          title: 'Create Events', // Set the title for the create screen
        }}
      />
    </Stack>
    );
}