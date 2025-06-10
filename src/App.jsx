import React from 'react';
import DynastyTable from './DynastyTable';
import TradeCalculator from './components/TradeCalculator';

export default function App() {
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <DynastyTable />
      <TradeCalculator />
    </div>
  );
}
