import React, { useState, useEffect } from "react";

const positions = ["QB", "RB", "WR", "TE", "K", "DEF", "PICK"];

export default function DynastyTable() {
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem("dynastyPlayers");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("dynastyPlayers", JSON.stringify(players));
  }, [players]);

  function updatePlayer(index, field, value) {
    setPlayers((prev) => {
      const updated = [...prev];
      const player = { ...updated[index] };
      player[field] = value;

      if (field === "birthday") {
        const birthDate = new Date(value);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        player.age = isNaN(age) ? "" : age;
      }

      if (field === "position" && ["DEF", "PICK"].includes(value)) {
        player.birthday = "";
        player.age = "";
      }

      updated[index] = player;
      return updated;
    });
  }

  function addPlayer() {
    if (players.length >= 40) return;
    setPlayers((prev) => [
      ...prev,
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
  }

  function removePlayer(index) {
    setPlayers((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Dynasty Tabelle</h1>

      <button onClick={addPlayer} disabled={players.length >= 40}>
        Spieler hinzufügen
      </button>

      <table border="1" cellPadding="5" style={{ marginTop: 20, width: "100%" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Position</th>
            <th>Name</th>
            <th>Geburtstag</th>
            <th>Alter</th>
            <th>Vormonat</th>
            <th>Aktuell</th>
            <th>Δ</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, i) => {
            const isDisabled = player.position === "DEF" || player.position === "PICK";
            const delta = (parseFloat(player.current) || 0) - (parseFloat(player.previous) || 0);

            return (
              <tr key={player.id}>
                <td>{i + 1}</td>
                <td>
                  <select
                    value={player.position}
                    onChange={(e) => updatePlayer(i, "position", e.target.value)}
                  >
                    <option value="">--</option>
                    {positions.map((pos) => (
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
                    onChange={(e) => updatePlayer(i, "name", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={player.birthday}
                    onChange={(e) => updatePlayer(i, "birthday", e.target.value)}
                    disabled={isDisabled}
                  />
                </td>
                <td>{isDisabled ? "-" : player.age}</td>
                <td>
                  <input
                    type="number"
                    value={player.previous}
                    onChange={(e) => updatePlayer(i, "previous", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={player.current}
                    onChange={(e) => updatePlayer(i, "current", e.target.value)}
                  />
                </td>
                <td>{delta.toFixed(1)}</td>
                <td>
                  <button onClick={() => removePlayer(i)}>Löschen</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
