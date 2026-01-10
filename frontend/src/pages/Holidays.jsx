import React, { useState, useEffect } from "react";
import { BASE_URL } from "../services/api";
import BackButton from "../components/BackButton";
const Holidays = () => {
  const token = localStorage.getItem("jwt");

  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH HOLIDAYS ================= */
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/holidays`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setHolidays(data);
      } catch (err) {
        console.error("Failed to fetch holidays");
      }
    };

    fetchHolidays();
  }, [token]);

  /* ================= ADD HOLIDAY ================= */
  const addHoliday = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch(`${BASE_URL}/api/holidays`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date, name }),
      });

      setDate("");
      setName("");

      // refresh list
      const res = await fetch(`${BASE_URL}/api/holidays`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHolidays(data);
    } catch (err) {
      console.error("Failed to add holiday");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE HOLIDAY ================= */
  const deleteHoliday = async (id) => {
    try {
      await fetch(`${BASE_URL}/api/holidays/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setHolidays((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error("Failed to delete holiday");
    }
  };

  return (
  <div className="container-fluid px-2 px-md-4">
     <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-3">Holidays</h4>
        <BackButton />
      </div>

    {/* ADD HOLIDAY */}
    <form onSubmit={addHoliday} className="row g-2 mb-4">
      <div className="col-12 col-md-4">
        <input
          type="date"
          className="form-control"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="col-12 col-md-6">
        <input
          type="text"
          className="form-control"
          placeholder="Holiday Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="col-12 col-md-2">
        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </form>

    {/* HOLIDAY LIST */}
    <ul className="list-group">
      {holidays.map((h) => (
        <li
          key={h._id}
          className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2"
        >
          <span className="text-break">
            {new Date(h.date).toLocaleDateString()} — {h.name}
          </span>

          <button
            className="btn btn-sm btn-danger w-100 w-md-auto"
            onClick={() => deleteHoliday(h._id)}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  </div>
);

};

export default Holidays