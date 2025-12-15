import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}