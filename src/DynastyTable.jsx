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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dynastyData");
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        setData(initialData);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dynastyData", JSON.stringify(data));
    }
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
    return filtered.length > 0 ? (sum / filtered.length).toFixed(1) : "-";
  };

  const sortData = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    const sorted = [...data].sort((a, b) => {
      const valA = key === "age" ? calculateAge(a.birthday) : a[key];
      const valB = key === "age" ? calculateAge(b.birthday) : b[key];
      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setSortConfig({ key, direction });
    setData(sorted);
  };

  const positionCount = data.reduce((acc, p) => {
    acc[p.position] = (acc[p.position] || 0) + 1;
    return acc;
  }, {});

  const sortArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? "▲" : "▼";
    }
    return "";
  };

  const columnStyle = "px-1 py-0.5 text-left whitespace-nowrap";
  const headerStyle = "bg-gray-200 px-1 py-1 text-left text-xs";

  return (
    <div className="p-4 text-xs">
      <h2 className="text-xl font-bold mb-1">🏈 Dynasty-Trade-Value</h2>
      <p className="mb-1">
        🧮 Positionen: {Object.entries(positionCount)
          .map(([pos, count]) => `${pos} (${count})`)
          .join(" | ")}<br />
        📊 Durchschnittsalter: <strong>{averageAge()} Jahre</strong>
      </p>
      <button
        onClick={handleAdd}
        className="mb-2 px-2 py-1 bg-green-600 text-white rounded"
      >
        + Spieler hinzufügen
      </button>

      <table className="w-full table-auto border border-collapse border-gray-300">
        <thead>
          <tr>
            <th className={headerStyle}>#</th>
            <th className={headerStyle} onClick={() => sortData("position")}>Position {sortArrow("position")}</th>
            <th className={headerStyle} onClick={() => sortData("name")}>Spieler {sortArrow("name")}</th>
            <th className={headerStyle}>Geburtstag</th>
            <th className={headerStyle} onClick={() => sortData("age")}>Alter {sortArrow("age")}</th>
            <th className={headerStyle} onClick={() => sortData("lastValue")}>Vormonat {sortArrow("lastValue")}</th>
            <th className={headerStyle} onClick={() => sortData("currentValue")}>Aktuell {sortArrow("currentValue")}</th>
            <th className={headerStyle} onClick={() => sortData("trend")}>Trend {sortArrow("trend")}</th>
            <th className={headerStyle}>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {data.map((player, index) => {
            const age = calculateAge(player.birthday);
            const trend = player.currentValue - player.lastValue;
            const bgColor = {
              QB: "bg-red-100",
              RB: "bg-green-100",
              WR: "bg-blue-100",
              TE: "bg-yellow-100",
              K: "bg-purple-100",
              DEF: "bg-gray-100",
            }[player.position] || "";

            const isDEF = player.position === "DEF";

            return (
              <tr key={index} className={`${bgColor} border-b text-xs`}>
                <td className={columnStyle}>{index + 1}</td>
                <td className={columnStyle}>
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
                <td className={columnStyle}>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    className="w-full"
                  />
                </td>
                <td className={columnStyle}>
                  {!isDEF && (
                    <input
                      type="date"
                      value={player.birthday}
                      onChange={(e) =>
                        handleChange(index, "birthday", e.target.value)
                      }
                      className="w-full"
                    />
                  )}
                </td>
                <td className={columnStyle}>{!isDEF ? age : "-"}</td>
                <td className={columnStyle}>
                  <input
                    type="number"
                    value={player.lastValue}
                    onChange={(e) =>
                      handleChange(index, "lastValue", e.target.value)
                    }
                    className="w-full"
                  />
                </td>
                <td className={columnStyle}>
                  <input
                    type="number"
                    value={player.currentValue}
                    onChange={(e) =>
                      handleChange(index, "currentValue", e.target.value)
                    }
                    className="w-full"
                  />
                </td>
                <td className={columnStyle}>{trend}</td>
                <td className={columnStyle}>
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
      <p className="text-right text-xs mt-1 text-gray-500">
        {data.length}/23 Spieler
      </p>
    </div>
  );
}
