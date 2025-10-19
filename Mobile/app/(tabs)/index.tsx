import React from 'react';
import { FinancialDashboard } from '@/components/modern/FinancialDashboard';

export default function HomeScreen() {
  const handleBridgePress = () => {
    console.log('Bridge assets pressed');
  };

  const handleVaultPress = () => {
    console.log('Manage vault pressed');
  };

  return (
    <FinancialDashboard
      totalValue={32500}
      btcCollateral={0.5}
      musdBalance={25000}
      portfolioChange={2.5}
      onBridgePress={handleBridgePress}
      onVaultPress={handleVaultPress}
    />
  );
}
