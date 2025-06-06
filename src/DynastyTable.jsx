import React, { useState, useEffect } from "react";

const MAX_PLAYERS = 23;

const initialData = [
  { position: "WR", name: "Ja'Marr Chase", birthday: "2000-03-01", lastValue: 93, currentValue: 93 },
  { position: "RB", name: "Saquon Barkley", birthday: "1997-02-09", lastValue: 67, currentValue: 66 },
  { position: "TE", name: "Trey McBride", birthday: "1999-11-22", lastValue: 58, currentValue: 58 },
];

const positionColors = {
  QB: "bg-red-100",
  RB: "bg-green-100",
  WR: "bg-blue-100",
  TE: "bg-yellow-100",
  K: "bg-purple-100",
  DEF: "bg-gray-200",
};

const positionOptions = ["QB", "RB", "WR", "TE", "K", "DEF"];

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

function averageAge(players) {
  const ages = players
    .filter(p => p.position !== "DEF" && p.birthday)
    .map(p => calculateAge(p.birthday));
  if (ages.length === 0) return "-";
  const avg = ages.reduce((a, b) => a + b, 0) / ages.length;
  return avg.toFixed(1);
}

export default function DynastyTable() {
  const [data, setData] = useState(initialData);
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    localStorage.setItem("dynastyData", JSON.stringify(data));
  }, [data]);

  const handleChange = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = field.includes("Value") ? Number(value) : value;
    setData(newData);
  };

  const handleAdd = () => {
    if (data.length >= MAX_PLAYERS) return;
    setData([
      ...data,
      { position: "QB", name: "", birthday: "2000-01-01", lastValue: 0, currentValue: 0 },
    ]);
  };

  const handleDelete = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["position", "name", "birthday", "lastValue", "currentValue"],
      ...data.map(p => [p.position, p.name, p.birthday, p.lastValue, p.currentValue])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "dynasty_export.csv");
    link.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.trim().split("\n").slice(1); // remove header
      const imported = rows.map(row => {
        const [position, name, birthday, lastValue, currentValue] = row.split(",");
        return {
          position,
          name,
          birthday,
          lastValue: Number(lastValue),
          currentValue: Number(currentValue),
        };
      });
      setData(imported);
    };
    reader.readAsText(file);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aValue = sortKey === "age" ? calculateAge(a.birthday) : a[sortKey];
    const bValue = sortKey === "age" ? calculateAge(b.birthday) : b[sortKey];
    if (aValue < bValue) return sortAsc ? -1 : 1;
    if (aValue > bValue) return sortAsc ? 1 : -1;
    return 0;
  });

  const sortIcon = (key) => {
    if (sortKey !== key) return "";
    return sortAsc ? " ▲" : " ▼";
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h2 className="text-xl font-bold">🏈 Dynasty-Trade-Value</h2>
        <span className="text-sm text-gray-600">{data.length}/{MAX_PLAYERS} Spieler</span>
      </div>

      <p className="mb-4 text-sm">📈 Durchschnittsalter: <strong>{averageAge(data)} Jahre</strong></p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleAdd}
          className={`px-3 py-1 rounded text-white ${data.length >= MAX_PLAYERS ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600'}`}
          disabled={data.length >= MAX_PLAYERS}
        >
          + Spieler hinzufügen
        </button>
        <button
          onClick={handleExport}
          className="px-3 py-1 rounded text-white bg-blue-600"
        >
          CSV Export
        </button>
        <label className="px-3 py-1 rounded text-white bg-gray-600 cursor-pointer">
          CSV Import
          <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full table-auto border border-collapse border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">#</th>
              <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("position")}>Position{sortIcon("position")}</th>
              <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("name")}>Spieler{sortIcon("name")}</th>
              <th className="border px-2 py-1">Geburtstag</th>
              <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("age")}>Alter{sortIcon("age")}</th>
              <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("lastValue")}>Vormonat{sortIcon("lastValue")}</th>
              <th className="border px-2 py-1 cursor-pointer" onClick={() => handleSort("currentValue")}>Aktuell{sortIcon("currentValue")}</th>
              <th className="border px-2 py-1">Trend</th>
              <th className="border px-2 py-1">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((player, index) => (
              <tr key={index} className={positionColors[player.position] || ""}>
                <td className="border px-2 py-1 text-center">{index + 1}</td>
                <td className="border px-2 py-1">
                  <select
                    value={player.position}
                    onChange={(e) => handleChange(index, "position", e.target.value)}
                    className="w-full border rounded px-1 py-0.5"
                  >
                    {positionOptions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-1">
                  <input value={player.name} onChange={(e) => handleChange(index, "name", e.target.value)} className="w-full border" />
                </td>
                <td className="border px-2 py-1">
                  <input type="date" value={player.birthday} onChange={(e) => handleChange(index, "birthday", e.target.value)} className="w-full border" />
                </td>
                <td className="border px-2 py-1 text-center">
                  {player.position === "DEF" ? "-" : calculateAge(player.birthday)}
                </td>
                <td className="border px-2 py-1">
                  <input type="number" value={player.lastValue} onChange={(e) => handleChange(index, "lastValue", e.target.value)} className="w-full border" />
                </td>
                <td className="border px-2 py-1">
                  <input type="number" value={player.currentValue} onChange={(e) => handleChange(index, "currentValue", e.target.value)} className="w-full border" />
                </td>
                <td className="border px-2 py-1 text-center">
                  {player.currentValue - player.lastValue}
                </td>
                <td className="border px-2 py-1 text-center">
                  <button onClick={() => handleDelete(index)} className="text-red-600">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
