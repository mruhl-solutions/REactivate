import { AlertCircle, CheckCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatusBadgeProps {
  clases: number;
}

export const StatusBadge = ({ clases }: StatusBadgeProps) => {
  const isActivo = clases > 0;
  
  return (
    <View style={[styles.badge, { backgroundColor: isActivo ? '#F0FDF4' : '#FEF2F2' }]}>
      {isActivo ? (
        <CheckCircle size={12} color="#16A34A" style={{ marginRight: 4 }} />
      ) : (
        <AlertCircle size={12} color="#DC2626" style={{ marginRight: 4 }} />
      )}
      <Text style={[styles.badgeText, { color: isActivo ? '#16A34A' : '#DC2626' }]}>
        {isActivo ? 'Con Saldo' : 'Sin Clases'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
});