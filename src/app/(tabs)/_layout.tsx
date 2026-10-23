import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const icono = (emoji: string) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#208AEF' }}>
      <Tabs.Screen name="index" options={{ title: 'Reportes', tabBarIcon: icono('🛠️') }} />
      <Tabs.Screen name="avisos" options={{ title: 'Avisos', tabBarIcon: icono('🔔') }} />
      <Tabs.Screen name="permisos" options={{ title: 'Permisos', tabBarIcon: icono('🔐') }} />
    </Tabs>
  );
}
