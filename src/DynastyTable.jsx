import React, { useEffect, useState } from "react";

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
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

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

    const isSpecial = updated[index].position === "DEF" || updated[index].position === "PICK";

    if (field === "position" && isSpecial) {
      updated[index].birthday = "";
      updated[index].lastValue = 0;
      updated[index].currentValue = 0;
    }

    setData(updated);
  };

  const handleAdd = () => {
    if (data.length >= 40) return;

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
    const filtered = data.filter(
      (p) => p.position !== "DEF" && p.position !== "PICK"
    );
    const sum = filtered.reduce(
      (acc, p) => acc + calculateAge(p.birthday),
      0
    );
    return filtered.length > 0
      ? (sum / filtered.length).toFixed(1)
      : "Keine Spieler";
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = sortKey === "age"
      ? calculateAge(a.birthday)
      : sortKey === "trend"
      ? a.currentValue - a.lastValue
      : a[sortKey];
    const valB = sortKey === "age"
      ? calculateAge(b.birthday)
      : sortKey === "trend"
      ? b.currentValue - b.lastValue
      : b[sortKey];

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const exportCSV = () => {
    const header = ["Position", "Name", "Geburtstag", "Vormonat", "Aktuell"];
    const rows = data.map((p) => [
      p.position,
      p.name,
      p.birthday,
      p.lastValue,
      p.currentValue,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dynasty_export.csv";
    a.click();
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n").slice(1);
      const imported = lines.map((line) => {
        const [position, name, birthday, lastValue, currentValue] = line.split(",");
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

  const renderArrow = (key) => {
    if (sortKey !== key) return "";
    return sortAsc ? "▲" : "▼";
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">🏈 Dynasty-Trade-Value</h2>
      <p className="mb-4">📊 Durchschnittsalter: <strong>{averageAge()} Jahre</strong></p>

      <div className="flex flex-wrap gap-2 mb-4">
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
          CSV Export
        </button>
        <label className="cursor-pointer px-4 py-1 bg-purple-600 text-white rounded">
          CSV Import
          <input
            type="file"
            accept=".csv"
            onChange={importCSV}
            className="hidden"
          />
        </label>
      </div>

      <table className="w-full text-sm border border-collapse">
        <thead className="bg-gray-200">
          <tr>
            <th>#</th>
            <th onClick={() => handleSort("position")} className="cursor-pointer">Position {renderArrow("position")}</th>
            <th onClick={() => handleSort("name")} className="cursor-pointer">Spieler {renderArrow("name")}</th>
            <th>Geburtstag</th>
            <th onClick={() => handleSort("age")} className="cursor-pointer">Alter {renderArrow("age")}</th>
            <th onClick={() => handleSort("lastValue")} className="cursor-pointer">Vormonat {renderArrow("lastValue")}</th>
            <th onClick={() => handleSort("currentValue")} className="cursor-pointer">Aktuell {renderArrow("currentValue")}</th>
            <th onClick={() => handleSort("trend")} className="cursor-pointer">Trend {renderArrow("trend")}</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((player, index) => {
            const isSpecial = player.position === "DEF" || player.position === "PICK";
            const age = isSpecial ? "–" : calculateAge(player.birthday);
            const trend = player.currentValue - player.lastValue;

            const color = {
              QB: "bg-red-100",
              RB: "bg-green-100",
              WR: "bg-blue-100",
              TE: "bg-yellow-100",
              K: "bg-purple-100",
              DEF: "bg-gray-100",
              PICK: "bg-white",
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
                    {["QB", "RB", "WR", "TE", "K", "DEF", "PICK"].map((pos) => (
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
                    disabled={isSpecial}
                  />
                </td>
                <td className="text-center">{age}</td>
                <td>
                  <input
                    type="number"
                    value={player.lastValue}
                    onChange={(e) => handleChange(index, "lastValue", e.target.value)}
                    className="w-full"
                    disabled={isSpecial}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={player.currentValue}
                    onChange={(e) => handleChange(index, "currentValue", e.target.value)}
                    className="w-full"
                    disabled={isSpecial}
                  />
                </td>
                <td className="text-center">{isSpecial ? 0 : trend}</td>
                <td>
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-600"
                  >🗑️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="text-right text-xs mt-2 text-gray-500">
        {data.length}/40 Spieler
      </p>
    </div>
  );
}