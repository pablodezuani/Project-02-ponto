import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen/LoginScreen';
import HomeScreen from './screens/HomeScreen/HomeScreen';
import AjusteScreen from './screens/AjusteScreen/AjusteScreen';
import ControlerScreen from './screens/ControlerScreen/ControlerScreen';
import ConfirmarPonto from './screens/ConfirmarPonto/ConfirmarPonto';
import DetailScreen from './screens/Detalhes/DetailScreen';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="AjusteScreen" component={AjusteScreen} />
        <Stack.Screen name="ControlerScreen" component={ControlerScreen} />
        <Stack.Screen name="ConfirmarPonto" component={ConfirmarPonto} />
        <Stack.Screen name="DetailScreen" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
