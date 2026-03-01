import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';


export default function TabLayout() {
  return (
    <Tabs
   screenOptions={{
    headerTitleAlign: 'center',
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
          title: 'الرئيسية',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
   
       <Tabs.Screen
        name="profile"
        options={{
          title: 'الملف الشخصي',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-sharp' : 'person-outline'} color={color} size={24} />
          ),
        }}
      /> 


         <Tabs.Screen
        name="about"
        options={{
          title: 'حول',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={24}/>
          ),
        }}
      />
    </Tabs>
   
  );
}
