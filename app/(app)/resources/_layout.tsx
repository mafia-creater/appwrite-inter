
import { Stack } from 'expo-router';

export default function ResourcesLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Resources', // Set the title for the main explore screen
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
      <Stack.Screen
      name='transport'
        options={{
            headerShown: false, // Show header on the detail screen
            title: 'Resources Transport', // Set the title for the detail screen
        }}
        />
        <Stack.Screen
        name='residence-permit'
        options={{
            headerShown: false, // Show header on the detail screen
            title: 'Resources Residence Permit', // Set the title for the detail screen
        }}
        />
        <Stack.Screen
        name="create"
        options={{ 
          title: 'Create Resource', // Set the title for the create resource screen
          headerShown: false // Hide header on the create resource screen
        }}
      />
    </Stack>
    );
}