import React, { useEffect, useState } from "react";

export default function UserDashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, []); 

  async function fetchUser() {
    try {
      const response = await fetch("/api/user?id=" + userId);

      const data = await response.json();

      setUser(data);

      if (data.role === "admin") {
        setIsAdmin(true);
      }
    } catch (err) {
      setError("Something went wrong");
    }
  }

  function deleteAccount() {
    fetch("/api/deleteUser", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  return (
    <div className="dashboard">
      <h1>Welcome {user.name}</h1>

      {error && <p className="error">{error}</p>}

      {isAdmin && (
        <div className="admin-panel">
          <h2>Admin Controls</h2>

          <button onClick={deleteAccount}>
            Delete Any User
          </button>
        </div>
      )}

      <ul>
        {user.permissions.map((perm) => (
          <li>{perm}</li>
        ))}
      </ul>
    </div>
  );
}
