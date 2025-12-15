import { Link, usePathname } from 'expo-router';
import { Calendar, Home, LogOut, Settings, Users } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

const MENU_ITEMS = [
  { name: 'Dashboard', icon: Home, path: '/' },
  { name: 'Clientes', icon: Users, path: '/clientes' },
  { name: 'Turnos', icon: Calendar, path: '/turnos' },
  { name: 'Configuración', icon: Settings, path: '/config' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <View className="hidden md:flex w-64 h-full bg-brand-dark flex-col justify-between p-6">
      <View>
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold tracking-tighter">
            RE<Text className="text-brand-red">activate</Text>
          </Text>
          <Text className="text-gray-400 text-xs uppercase tracking-widest">
            Bienestar y entreno
          </Text>
        </View>

        {/* Navegación */}
        <View className="space-y-2">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path as any} asChild>
                <Pressable 
                  className={`flex-row items-center space-x-3 p-3 rounded-lg transition-all ${
                    isActive ? 'bg-brand-red' : 'hover:bg-gray-800'
                  }`}
                >
                  <Icon 
                    size={20} 
                    color={isActive ? '#FFFFFF' : '#9CA3AF'} 
                  />
                  <Text className={`font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {item.name}
                  </Text>
                </Pressable>
              </Link>
            );
          })}
        </View>
      </View>

      {/* Footer / Logout */}
      <Pressable className="flex-row items-center space-x-3 p-3 mt-auto">
        <LogOut size={20} color="#9CA3AF" />
        <Text className="text-gray-400 font-medium">Cerrar Sesión</Text>
      </Pressable>
    </View>
  );
};