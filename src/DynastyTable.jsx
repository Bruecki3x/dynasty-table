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
    const filtered = data.filter((p) => p.position !== "DEF");
    const sum = filtered.reduce(
      (acc, player) => acc + calculateAge(player.birthday),
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

    const sorted = [...data].sort((a, b) => {
      let aVal, bVal;

      if (key === "birthday") {
        aVal = new Date(a.birthday);
        bVal = new Date(b.birthday);
      } else if (key === "trend") {
        aVal = a.currentValue - a.lastValue;
        bVal = b.currentValue - b.lastValue;
      } else {
        aVal = a[key];
        bVal = b[key];
      }

      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });

    setData(sorted);
  };

  const getSortIcon = (key) => {
    if (sortKey !== key) return "";
    return sortAsc ? "▲" : "▼";
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">🏈 Dynasty-Trade-Value</h2>
      <p className="mb-4">
        📊 Durchschnittsalter: <strong>{averageAge()} Jahre</strong>
      </p>
      <button
        onClick={handleAdd}
        className="mb-4 px-4 py-1 bg-green-600 text-white rounded"
      >
        + Spieler hinzufügen
      </button>
      <table className="w-full table-auto border border-collapse border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th>#</th>
            <th
              onClick={() => handleSort("position")}
              className="cursor-pointer"
            >
              Position {getSortIcon("position")}
            </th>
            <th onClick={() => handleSort("name")} className="cursor-pointer">
              Spieler {getSortIcon("name")}
            </th>
            <th
              onClick={() => handleSort("birthday")}
              className="cursor-pointer"
            >
              Geburtstag {getSortIcon("birthday")}
            </th>
            <th
              onClick={() => handleSort("age")}
              className="cursor-pointer"
            >
              Alter {getSortIcon("age")}
            </th>
            <th
              onClick={() => handleSort("lastValue")}
              className="cursor-pointer"
            >
              Vormonat {getSortIcon("lastValue")}
            </th>
            <th
              onClick={() => handleSort("currentValue")}
              className="cursor-pointer"
            >
              Aktuell {getSortIcon("currentValue")}
            </th>
            <th
              onClick={() => handleSort("trend")}
              className="cursor-pointer"
            >
              Trend {getSortIcon("trend")}
            </th>
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
              K: "bg-purple-100",
              DEF: "bg-gray-100",
            }[player.position] || "";

            return (
              <tr key={index} className={`${color} border-b`}>
                <td>{index + 1}</td>
                <td>
                  <select
                    value={player.position}
                    onChange={(e) =>
                      handleChange(index, "position", e.target.value)
                    }
                    className="w-full"
                  >
                    {["QB", "RB", "WR", "TE", "K", "DEF"].map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    className="w-full"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={player.birthday}
                    onChange={(e) =>
                      handleChange(index, "birthday", e.target.value)
                    }
                    className="w-full"
                  />
                </td>
                <td>{age}</td>
                <td>
                  <input
                    type="number"
                    value={player.lastValue}
                    onChange={(e) =>
                      handleChange(index, "lastValue", e.target.value)
                    }
                    className="w-full"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={player.currentValue}
                    onChange={(e) =>
                      handleChange(index, "currentValue", e.target.value)
                    }
                    className="w-full"
                  />
                </td>
                <td>{trend}</td>
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
