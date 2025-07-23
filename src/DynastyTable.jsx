import React, { useState, useEffect } from "react";

const initialPlayers = [];

const positions = ["QB", "RB", "WR", "TE", "K", "DEF", "PICK"];

const DynastyTable = () => {
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem("dynastyPlayers");
    return saved ? JSON.parse(saved) : initialPlayers;
  });

  useEffect(() => {
    localStorage.setItem("dynastyPlayers", JSON.stringify(players));
  }, [players]);

  const updatePlayer = (index, field, value) => {
    console.log(`Update player at index ${index}, field: ${field}, value: ${value}`);

    const updated = [...players];
    const updatedPlayer = { ...updated[index], [field]: value };

    if (field === "birthday") {
      // Hier sicherstellen, dass das Datum im yyyy-mm-dd Format gespeichert wird
      updatedPlayer.birthday = value;

      const birthDate = new Date(value);
      const ageDifMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDifMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      updatedPlayer.age = isNaN(age) ? "" : age;
    }

    // Wenn Position geändert wird und "DEF" oder "PICK" ist, Geburtstag & Alter leeren
    if (field === "position" && ["DEF", "PICK"].includes(value)) {
      updatedPlayer.birthday = "";
      updatedPlayer.age = "";
    }

    updated[index] = updatedPlayer;
    setPlayers(updated);
  };

  const addPlayer = () => {
    if (players.length >= 40) return;
    setPlayers([
      ...players,
      {
        id: Date.now(),
        position: "",
        name: "",
        birthday: "",
        age: "",
        previous: "",
        current: "",
      },
    ]);
  };

  const removePlayer = (index) => {
    const updated = [...players];
    updated.splice(index, 1);
    setPlayers(updated);
  };

  const getPositionCount = (pos) =>
    players.filter((p) => p.position === pos).length;

  const getAverageAge = () => {
    const ages = players
      .filter((p) => !["DEF", "PICK"].includes(p.position))
      .map((p) => parseInt(p.age))
      .filter((age) => !isNaN(age));
    if (ages.length === 0) return 0;
    return (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dynasty Tabelle</h1>

      <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
        {positions.map((pos) => (
          <div key={pos}>
            <strong>{pos}:</strong> {getPositionCount(pos)}
          </div>
        ))}
        <div>
          <strong>Ø Alter:</strong> {getAverageAge()}
        </div>
        <div>
          <strong>{players.length}/40 Spieler</strong>
        </div>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th>#</th>
            <th>Pos</th>
            <th>Name</th>
            <th>Geburtstag</th>
            <th>Alter</th>
            <th>Vormonat</th>
            <th>Aktuell</th>
            <th>Δ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => {
            const isDisabled = ["DEF", "PICK"].includes(player.position);
            const delta =
              parseFloat(player.current) - parseFloat(player.previous) || 0;
            return (
              <tr key={player.id} className="text-center border-t">
                <td>{index + 1}</td>
                <td>
                  <select
                    value={player.position}
                    onChange={(e) =>
                      updatePlayer(index, "position", e.target.value)
                    }
                    className="rounded px-1"
                  >
                    <option value=""></option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    value={player.name}
                    onChange={(e) =>
                      updatePlayer(index, "name", e.target.value)
                    }
                    className="rounded px-1"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={player.birthday}
                    onChange={(e) =>
                      updatePlayer(index, "birthday", e.target.value)
                    }
                    className="rounded px-1"
                    disabled={isDisabled}
                  />
                </td>
                <td>{isDisabled ? "-" : player.age}</td>
                <td>
                  <input
                    type="number"
                    value={player.previous}
                    onChange={(e) =>
                      updatePlayer(index, "previous", e.target.value)
                    }
                    className="rounded px-1 w-20"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={player.current}
                    onChange={(e) =>
                      updatePlayer(index, "current", e.target.value)
                    }
                    className="rounded px-1 w-20"
                  />
                </td>
                <td>{delta.toFixed(1)}</td>
                <td>
                  <button
                    onClick={() => removePlayer(index)}
                    className="text-red-500"
                  >
                    ✖
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          onClick={addPlayer}
          disabled={players.length >= 40}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Spieler hinzufügen
        </button>
      </div>
    </div>
  );
};

export default DynastyTable;
