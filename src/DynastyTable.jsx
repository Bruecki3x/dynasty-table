import React, { useState, useEffect, useRef } from "react";

const initialData = [
  { position: "WR", name: "Ja'Marr Chase", birthday: "2000-03-01", lastValue: 93, currentValue: 93 },
  { position: "RB", name: "Saquon Barkley", birthday: "1997-02-09", lastValue: 67, currentValue: 66 },
  { position: "TE", name: "Trey McBride", birthday: "1999-11-22", lastValue: 58, currentValue: 58 },
];

const calculateAge = (birthday) => {
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export default function DynastyTable() {
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem("dynastyData");
    return stored ? JSON.parse(stored) : initialData;
  });
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const fileInputRef = useRef();

  useEffect(() => {
    localStorage.setItem("dynastyData", JSON.stringify(data));
  }, [data]);

  const handleChange = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = field.includes("Value") ? Number(value) : value;
    setData(newData);
  };

  const handleAdd = () => {
    if (data.length >= 23) return;
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

  const exportToCSV = () => {
    const headers = ["Position", "Name", "Geburtstag", "Vormonat", "Aktuell"];
    const rows = data.map(row => [row.position, row.name, row.birthday, row.lastValue, row.currentValue]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "dynasty_export.csv");
    link.click();
  };

  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split("\n").slice(1); // skip header
      const newData = lines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          const [position, name, birthday, lastValue, currentValue] = line.split(",");
          return {
            position,
            name,
            birthday,
            lastValue: Number(lastValue),
            currentValue: Number(currentValue)
          };
        });
      setData(newData.slice(0, 23));
    };
    reader.readAsText(file);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aValue = sortKey === "birthday" ? new Date(a[sortKey]) : a[sortKey];
    const bValue = sortKey === "birthday" ? new Date(b[sortKey]) : b[sortKey];
    if (aValue < bValue) return sortAsc ? -1 : 1;
    if (aValue > bValue) return sortAsc ? 1 : -1;
    return 0;
  });

  const avgAge = (data.length > 0)
    ? (data.filter(p => p.position !== "DEF").reduce((sum, p) => sum + calculateAge(p.birthday), 0) /
       data.filter(p => p.position !== "DEF").length).toFixed(1)
    : 0;

  const positionColors = {
    QB: "bg-red-50",
    RB: "bg-green-50",
    WR: "bg-blue-50",
    TE: "bg-yellow-50",
    K: "bg-pink-50",
    DEF: "bg-gray-100",
  };

  const positionOptions = ["QB", "RB", "WR", "TE", "K", "DEF"];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        <span role="img" aria-label="football">🏈</span> Dynasty-Trade-Value
      </h2>
      <p className="mb-2 text-sm">📏 Durchschnittsalter: <strong>{avgAge} Jahre</strong></p>
      <div className="flex flex-wrap gap-3 mb-3 items-center">
        <button
          onClick={handleAdd}
          className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
          disabled={data.length >= 23}
        >
          + Spieler hinzufügen
        </button>
        <button
          onClick={exportToCSV}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          CSV Export
        </button>
        <button
          onClick={() => fileInputRef.current.click()}
          className="px-3 py-1 bg-orange-500 text-white rounded"
        >
          CSV Import
        </button>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={importFromCSV}
          className="hidden"
        />
        <span className="text-sm text-gray-600">{data.length}/23 Spieler</span>
      </div>
      <table className="w-full table-auto border border-collapse border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("index")}>#</th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("position")}>Position</th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("name")}>Spieler</th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("birthday")}>Geburtstag</th>
            <th className="border p-2">Alter</th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("lastValue")}>Vormonat</th>
            <th className="border p-2 cursor-pointer" onClick={() => handleSort("currentValue")}>Aktuell</th>
            <th className="border p-2">Trend</th>
            <th className="border p-2">Aktion</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index} className={positionColors[row.position] || ""}>
              <td className="border p-2 text-center">{index + 1}</td>
              <td className="border p-2 text-center">
                <select
                  className="w-full border rounded px-1 py-0.5"
                  value={row.position}
                  onChange={(e) => handleChange(index, "position", e.target.value)}
                >
                  {positionOptions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </td>
              <td className="border p-2">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  className="w-full border rounded px-1 py-0.5"
                />
              </td>
              <td className="border p-2">
                <input
                  type="date"
                  value={row.birthday}
                  onChange={(e) => handleChange(index, "birthday", e.target.value)}
                  className="w-full border rounded px-1 py-0.5"
                />
              </td>
              <td className="border p-2 text-center">
                {row.position === "DEF" ? "-" : calculateAge(row.birthday)}
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={row.lastValue}
                  onChange={(e) => handleChange(index, "lastValue", e.target.value)}
                  className="w-full border rounded px-1 py-0.5"
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={row.currentValue}
                  onChange={(e) => handleChange(index, "currentValue", e.target.value)}
                  className="w-full border rounded px-1 py-0.5"
                />
              </td>
              <td className="border p-2 text-center">
                {row.currentValue - row.lastValue}
              </td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
