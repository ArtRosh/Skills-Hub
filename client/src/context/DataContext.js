import { createContext, useEffect, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // Tracks whether authentication status is still being determined
  const [authLoading, setAuthLoading] = useState(true);
  

  // Public data for Home
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);

  // Auth check (session)
  useEffect(() => {
    fetch("/api/check_session", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Not Authorized");
        return r.json();
      })
      .then((user) => {
        setCurrentUser(user)
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  // Public topics (Home)
  useEffect(() => {
    fetch("/api/topics", { credentials: "include" }) 
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load topics");
        return r.json();
      })
      .then((data) => setTopics(data))
      .catch(() => setTopics([]))
      // Set topicsLoading to false after topics fetch finishes
      .finally(() => setTopicsLoading(false));
  }, []);

  function login(payload) {
    return fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).then((r) => {
      if (!r.ok) {
        return r.json().then((data) => {
          throw new Error(data.error || "Login failed");
        });
      }
      return r.json().then((user) => {
        setCurrentUser(user);
        return user;
      });
    });
  }

  function logout() {
    return fetch("/api/logout", { method: "DELETE", credentials: "include" }).then(
      () => setCurrentUser(null)
    );
  }

  function signup(payload) {
    return fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).then((r) => {
      if (!r.ok) {
        return r.json().then((data) => {
          throw new Error(data.error || "Signup failed");
        });
      }
      return r.json().then((user) => {
        setCurrentUser(user);
        return user;
      });
    });
  }

  return (
    <DataContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        authLoading,
        topics,
        setTopics,
        topicsLoading,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export default DataContext;