import React, { useState, useEffect } from "react";

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

const defaultPlayer = {
  position: "QB",
  name: "",
  birthday: "2000-01-01",
  lastValue: 0,
  currentValue: 0,
};

export default function DynastyTable() {
  const [data, setData] = useState([]);
  const [isClient, setIsClient] = useState(false); // 🧠 zeigt an, ob Browser verfügbar ist

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
      const stored = localStorage.getItem("dynastyData");
      if (stored) {
        try {
          setData(JSON.parse(stored));
        } catch (err) {
          console.error("Fehler beim Parsen:", err);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("dynastyData", JSON.stringify(data));
    }
  }, [data, isClient]);

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
    setData([...data, { ...defaultPlayer }]);
  };

  const handleDelete = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  const averageAge = () => {
    const relevant = data.filter((p) => p.position !== "DEF");
    const sum = relevant.reduce((acc, p) => acc + calculateAge(p.birthday), 0);
    return relevant.length > 0
      ? (sum / relevant.length).toFixed(1)
      : "Keine Spieler";
  };

  if (!isClient) {
    return <p>Lade Daten...</p>; // 🚀 blockiert das Rendern, bis Browser bereit
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">🏈 Dynasty-Trade-Value</h2>
      <p className="mb-4">📊 Durchschnittsalter: <strong>{averageAge()} Jahre</strong></p>
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
                    {["QB", "RB", "WR", "TE", "DEF"].map((pos) => (
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
