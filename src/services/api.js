const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const withTimeout = (promise, ms = 3000) => {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))
  ]);
};

export const playerAPI = {
  async getAll() {
    try {
      const response = await withTimeout(fetch(`${API_URL}/players`));
      if (response.ok) return await response.json();
      throw new Error("Failed to fetch players");
    } catch (error) {
      console.error("getAll players failed:", error.message);
      throw error;
    }
  },

  async create(playerData) {
    try {
      const response = await withTimeout(
        fetch(`${API_URL}/players`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(playerData)
        })
      );
      if (response.ok) return await response.json();
      throw new Error("Failed to create player");
    } catch (error) {
      console.error("create player failed:", error.message);
      throw error;
    }
  },

  async update(id, playerData) {
    try {
      const response = await withTimeout(
        fetch(`${API_URL}/players/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(playerData)
        })
      );
      if (response.ok) return await response.json();
      throw new Error("Failed to update player");
    } catch (error) {
      console.error("update player failed:", error.message);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await withTimeout(
        fetch(`${API_URL}/players/${id}`, { method: "DELETE" })
      );
      if (response.ok) return await response.json();
      throw new Error("Failed to delete player");
    } catch (error) {
      console.error("delete player failed:", error.message);
      throw error;
    }
  },

  async replaceAll(players) {
    try {
      const response = await withTimeout(
        fetch(`${API_URL}/players/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(players)
        })
      );
      if (response.ok) return await response.json();
      throw new Error("Failed to batch update players");
    } catch (error) {
      console.error("batch update players failed:", error.message);
      throw error;
    }
  }
};

export const seasonAPI = {
  async getAll() {
    try {
      const response = await withTimeout(fetch(`${API_URL}/seasons`));
      if (response.ok) return await response.json();
      throw new Error("Failed to fetch seasons");
    } catch (error) {
      console.error("getAll seasons failed:", error.message);
      throw error;
    }
  },

  async create(seasonData) {
    try {
      const response = await withTimeout(
        fetch(`${API_URL}/seasons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(seasonData)
        })
      );
      if (response.ok) return await response.json();
      throw new Error("Failed to create season");
    } catch (error) {
      console.error("create season failed:", error.message);
      throw error;
    }
  },

  async replaceAll(seasons) {
    try {
      const response = await withTimeout(
        fetch(`${API_URL}/seasons/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(seasons)
        })
      );
      if (response.ok) return await response.json();
      throw new Error("Failed to replace all seasons");
    } catch (error) {
      console.error("replaceAll seasons failed:", error.message);
      throw error;
    }
  },

  async update(id, seasonData) {
    try {
      const response = await withTimeout(
        fetch(`${API_URL}/seasons/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(seasonData)
        })
      );
      if (response.ok) return await response.json();
      throw new Error("Failed to update season");
    } catch (error) {
      console.error("update season failed:", error.message);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await withTimeout(
        fetch(`${API_URL}/seasons/${id}`, { method: "DELETE" })
      );
      if (response.ok) return await response.json();
      throw new Error("Failed to delete season");
    } catch (error) {
      console.error("delete season failed:", error.message);
      throw error;
    }
  }
};
