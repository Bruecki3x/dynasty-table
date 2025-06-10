import React, { useState } from "react";

const TradeCalculator = () => {
  const [partnerA, setPartnerA] = useState("");
  const [partnerB, setPartnerB] = useState("");

  const parseValues = (input) => {
    return input
      .split(",")
      .map((val) => parseFloat(val.trim()))
      .filter((val) => !isNaN(val));
  };

  const calculateTradeValue = (values) => {
    if (values.length === 1) return values[0];
    if (values.length === 2) {
      const [a, b] = values.sort((x, y) => y - x); // a = höher, b = niedriger
      return a + b * 0.5;
    }
    return 0; // Nur 1:1, 2:1, 2:2 erlaubt
  };

  const valuesA = parseValues(partnerA);
  const valuesB = parseValues(partnerB);

  const valueA = calculateTradeValue(valuesA);
  const valueB = calculateTradeValue(valuesB);

  const minValue = Math.min(valueA, valueB);
  const maxValue = Math.max(valueA, valueB);
  const difference = maxValue - minValue;
  const percentDiff = minValue === 0 ? 0 : (difference / minValue) * 100;

  const isFair = percentDiff <= 10;

  return (
    <div className="mt-6 p-4 border rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Trade Value Rechner</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Tradepartner A (z. B. 80, 70)</label>
          <input
            type="text"
            value={partnerA}
            onChange={(e) => setPartnerA(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="z. B. 80, 70"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Tradepartner B (z. B. 100)</label>
          <input
            type="text"
            value={partnerB}
            onChange={(e) => setPartnerB(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="z. B. 100"
          />
        </div>
      </div>

      <div className="mt-4">
        <p><strong>Wert A:</strong> {valueA}</p>
        <p><strong>Wert B:</strong> {valueB}</p>
        <p><strong>Unterschied:</strong> {difference.toFixed(2)} ({percentDiff.toFixed(2)}%)</p>
        <p className={`font-bold ${isFair ? "text-green-600" : "text-red-600"}`}>
          {isFair ? "✅ Fairer Trade möglich!" : "❌ Trade nicht fair (mehr als 10% Unterschied)"}
        </p>
      </div>
    </div>
  );
};

export default TradeCalculator;
