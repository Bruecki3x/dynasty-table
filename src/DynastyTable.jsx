import { useState, useEffect } from "react";

const MAX_PLAYERS = 23;

const initialData = JSON.parse(localStorage.getItem("dynastyData")) || [
  { position: "WR", name: "Ja'Marr Chase", birthday: "2000-03-01", lastValue: 93, currentValue: 93 },
  { position: "RB", name: "Saquon Barkley", birthday: "1997-02-09", lastValue: 67, currentValue: 66 },
  { position: "TE", name: "Trey McBride", birthday: "1999-11-22", lastValue: 58, currentValue: 58 },
];

const positionColors = {
  QB: "bg-red-200",
  WR: "bg-blue-200",
  RB: "bg-green-200",
  TE: "bg-yellow-200",
  K: "bg-purple-200",
  DEF: "bg-gray-300",
};

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

function averageAge(data) {
  const ages = data
    .filter(player => player.position !== "DEF")
    .map(player => calculateAge(player.birthday));
  const sum = ages.reduce((a, b) => a + b, 0);
  return ages.length > 0 ? (sum / ages.length).toFixed(1) : "-";
}

export default function DynastyTable() {
  const [data, setData] = useState(initialData);
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem("dynastyData", JSON.stringify(data));
  }, [data]);

  const handleChange = (index, field, value) => {
    const newData = [...data];

    if (field === "position") {
      newData[index][field] = value;
      if (value === "DEF" || value === "K") {
        newData[index].birthday = "";
        newData[index].lastValue = 0;
        newData[index].currentValue = 0;
      }
    } else if (field === "lastValue" || field === "currentValue") {
      newData[index][field] = Number(value);
    } else if (field === "birthday") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        newData[index][field] = value;
      }
    } else {
      newData[index][field] = value;
    }

    setData(newData);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleAdd = () => {
    if (data.length >= MAX_PLAYERS) return;
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
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  const exportToCSV = () => {
    const headers = ["Position", "Name", "Geburtstag", "Wert Vormonat", "Wert Aktuell"];
    const rows = data.map(d => [d.position, d.name, d.birthday, d.lastValue, d.currentValue]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "dynasty_export.csv");
    link.click();
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aValue = sortKey === "birthday" ? new Date(a[sortKey]) : a[sortKey];
    const bValue = sortKey === "birthday" ? new Date(b[sortKey]) : b[sortKey];
    if (aValue < bValue) return sortAsc ? -1 : 1;
    if (aValue > bValue) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} p-4 min-h-screen`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-lg sm:text-xl font-bold">Dynasty Spieler-Tabelle</h1>
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-1 text-sm sm:text-base">
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            Dark Mode
          </label>
          <button onClick={exportToCSV} className="bg-blue-500 text-white px-3 py-2 rounded text-sm sm:text-base">CSV Export</button>
        </div>
      </div>

      <p className="mt-2 mb-1 text-sm">📊 Durchschnittsalter: <span className="font-semibold">{averageAge(data)} Jahre</span></p>
      <p className="mb-4 text-sm">👥 Spieleranzahl: <span className="font-semibold">{data.length}/{MAX_PLAYERS}</span></p>

      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <label className="font-semibold text-sm">Sortieren nach:</label>
        <select onChange={(e) => handleSort(e.target.value)} className="border p-1 text-sm">
          <option value="">Keine</option>
          <option value="position">Position</option>
          <option value="name">Spielername</option>
          <option value="birthday">Geburtstag</option>
          <option value="lastValue">Wert Vormonat</option>
          <option value="currentValue">Wert Aktuell</option>
        </select>
        <button 
          onClick={handleAdd} 
          className={`px-3 py-2 rounded text-white text-sm sm:text-base ${data.length >= MAX_PLAYERS ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500'}`}
          disabled={data.length >= MAX_PLAYERS}
        >
          + Spieler hinzufügen
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full border border-gray-300 text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">#</th>
              <th className="border p-2">Position</th>
              <th className="border p-2">Spieler</th>
              <th className="border p-2">Geburtstag</th>
              <th className="border p-2">Alter</th>
              <th className="border p-2">Wert Vormonat</th>
              <th className="border p-2">Wert Aktuell</th>
              <th className="border p-2">Trend</th>
              <th className="border p-2">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => {
              const isDEForK = row.position === "DEF" || row.position === "K";
              return (
                <tr key={index} className={`${positionColors[row.position] || ""}`}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">
                    <select
                      value={row.position}
                      onChange={(e) => handleChange(index, "position", e.target.value)}
                      className="w-full border px-1 bg-white text-xs sm:text-sm"
                    >
                      <option value="QB">QB</option>
                      <option value="WR">WR</option>
                      <option value="RB">RB</option>
                      <option value="TE">TE</option>
                      <option value="K">K</option>
                      <option value="DEF">DEF</option>
                    </select>
                  </td>
                  <td className="border p-2">
                    <input
                      value={row.name}
                      onChange={(e) => handleChange(index, "name", e.target.value)}
                      className="w-full border px-1 text-xs sm:text-sm"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="date"
                      value={row.birthday}
                      onChange={(e) => handleChange(index, "birthday", e.target.value)}
                      className="w-full border px-1 text-xs sm:text-sm"
                      disabled={row.position === "DEF"}
                    />
                  </td>
                  <td className="border p-2 text-center">
                    {row.position === "DEF" ? "–" : calculateAge(row.birthday)}
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={isDEForK ? 0 : row.lastValue}
                      onChange={(e) => handleChange(index, "lastValue", e.target.value)}
                      className="w-full border px-1 text-xs sm:text-sm"
                      disabled={isDEForK}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={isDEForK ? 0 : row.currentValue}
                      onChange={(e) => handleChange(index, "currentValue", e.target.value)}
                      className="w-full border px-1 text-xs sm:text-sm"
                      disabled={isDEForK}
                    />
                  </td>
                  <td className="border p-2 text-center">
                    {isDEForK ? 0 : row.currentValue - row.lastValue}
                  </td>
                  <td className="border p-2 text-center">
                    <button onClick={() => handleDelete(index)} className="text-red-600 text-sm">🗑</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
