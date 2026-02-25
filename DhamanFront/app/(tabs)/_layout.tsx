import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';


export default function TabLayout() {
  return (
    <Tabs
   screenOptions={{
    headerStyle: { backgroundColor: '#1e293b' },
    headerTintColor: '#fff',
    tabBarActiveTintColor: '#1e293b',
    tabBarInactiveTintColor: '#94a3b8',
    tabBarStyle: { backgroundColor: '#f8f9fa' },
  }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={24}/>
          ),
        }}
      />
       <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-sharp' : 'person-outline'} color={color} size={24} />
          ),
        }}
      /> 
    </Tabs>
   
  );
}
