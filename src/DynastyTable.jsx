// DynastyTable.js
import React, { useState, useEffect } from "react";

const initialData = [];

function calculateAge(birthday) {
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function DynastyTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("dynastyData");
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      setData(initialData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dynastyData", JSON.stringify(data));
  }, [data]);

  const handleChange = (index, field, value) => {
    const updated = [...data];
    updated[index][field] =
      field === "currentValue" || field === "lastValue"
        ? Number(value)
        : value;
    setData(updated);
  };

  const handleAdd = () => {
    if (data.length >= 23) return;
    setData([
      ...data,
      {
        position: "QB",
        name: "",
        birthday: "2000-01-01",
        lastValue: 0,
        currentValue: 0,
      },
    ]);
  };

  const handleDelete = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  const averageAge = () => {
    const filtered = data.filter((player) => player.position !== "DEF");
    const sum = filtered.reduce(
      (acc, player) => acc + calculateAge(player.birthday),
      0
    );
    return filtered.length > 0
      ? (sum / filtered.length).toFixed(1)
      : "Keine Spieler";
  };

  const exportCSV = () => {
    const headers = [
      "Position",
      "Name",
      "Geburtstag",
      "Vormonat",
      "Aktuell",
    ];
    const rows = data.map((player) => [
      player.position,
      player.name,
      player.birthday,
      player.lastValue,
      player.currentValue,
    ]);
    const csvContent =
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "dynasty_export.csv");
    link.click();
  };

  const importCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split("\n").slice(1);
      const newData = lines
        .map((line) => line.split(","))
        .filter((line) => line.length >= 5)
        .map(([position, name, birthday, lastValue, currentValue]) => ({
          position,
          name,
          birthday,
          lastValue: Number(lastValue),
          currentValue: Number(currentValue),
        }));
      setData(newData);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">🏈 Dynasty-Trade-Value</h2>
      <p className="mb-4">
        📊 Durchschnittsalter: <strong>{averageAge()} Jahre</strong>
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={handleAdd}
          className="px-4 py-1 bg-green-600 text-white rounded"
        >
          + Spieler hinzufügen
        </button>
        <button
          onClick={exportCSV}
          className="px-4 py-1 bg-blue-600 text-white rounded"
        >
          📤 CSV Export
        </button>
        <label className="bg-gray-200 px-3 py-1 rounded cursor-pointer">
          📥 CSV Import
          <input
            type="file"
            accept=".csv"
            onChange={importCSV}
            className="hidden"
          />
        </label>
      </div>
      <table className="w-full table-auto border border-collapse border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th>#</th>
            <th>Position</th>
            <th>Spieler</th>
            <th>Geburtstag</th>
            <th>Alter</th>
            <th>Vormonat</th>
            <th>Aktuell</th>
            <th>Trend</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {data.map((player, index) => {
            const age = calculateAge(player.birthday);
            const trend = player.currentValue - player.lastValue;
            const color = {
              QB: "bg-red-100",
              RB: "bg-green-100",
              WR: "bg-blue-100",
              TE: "bg-yellow-100",
              DEF: "bg-gray-100",
              K: "bg-purple-100",
            }[player.position] || "";

            return (
              <tr key={index} className={`${color} border-b`}>
                <td>{index + 1}</td>
                <td>
                  <select
                    value={player.position}
                    onChange={(e) => handleChange(index, "position", e.target.value)}
                    className="w-full"
                  >
                    {["QB", "RB", "WR", "TE", "K", "DEF"].map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    className="w-full"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={player.birthday}
                    onChange={(e) => handleChange(index, "birthday", e.target.value)}
                    className="w-full"
                    disabled={player.position === "DEF"}
                  />
                </td>
                <td>{player.position === "DEF" ? "-" : age}</td>
                <td>
                  <input
                    type="number"
                    value={player.lastValue}
                    onChange={(e) => handleChange(index, "lastValue", e.target.value)}
                    className="w-full"
                    disabled={player.position === "DEF"}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={player.currentValue}
                    onChange={(e) => handleChange(index, "currentValue", e.target.value)}
                    className="w-full"
                    disabled={player.position === "DEF"}
                  />
                </td>
                <td>{player.position === "DEF" ? "-" : trend}</td>
                <td>
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-600"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-right text-xs mt-2 text-gray-500">
        {data.length}/23 Spieler
      </p>
    </div>
  );
}
