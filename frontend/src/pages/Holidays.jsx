import React, { useState, useEffect } from "react";
import { BASE_URL } from "../services/api";
import BackButton from "../components/BackButton";

const Holidays = () => {
  const token = localStorage.getItem("jwt");

  const [holidays, setHolidays] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(null);

  const [date, setDate] = useState("");
  const [name, setName] = useState("");

  // FETCH
  const fetchHolidays = async () => {
    const res = await fetch(`${BASE_URL}/api/holidays`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setHolidays(data);
    groupByMonth(data);
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // GROUP BY MONTH
  const groupByMonth = (data) => {
    const groupedData = {};

    data.forEach((h) => {
      const month = new Date(h.date).toLocaleString("default", {
        month: "long",
        year: "numeric"
      });

      if (!groupedData[month]) groupedData[month] = [];
      groupedData[month].push(h);
    });

    setGrouped(groupedData);
  };

  // ADD
  const addHoliday = async (e) => {
    e.preventDefault();

    await fetch(`${BASE_URL}/api/holidays`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ date, name })
    });

    setDate("");
    setName("");
    fetchHolidays();
  };

  // DELETE
  const deleteHoliday = async (id) => {
    await fetch(`${BASE_URL}/api/holidays/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchHolidays();
  };

  // CALENDAR GENERATOR
  const renderCalendar = (monthName) => {
    const monthDate = new Date(monthName);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const days = new Date(year, month + 1, 0).getDate();

    const monthHolidays = grouped[monthName] || [];

    return (
      <div className="border p-3 mt-2">
        <div className="d-flex flex-wrap">
          {[...Array(days)].map((_, i) => {
            const day = i + 1;

            const isHoliday = monthHolidays.some((h) => {
              const d = new Date(h.date);
              return d.getDate() === day;
            });

            return (
              <div
                key={day}
                style={{
                  width: "40px",
                  height: "40px",
                  margin: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isHoliday ? "#ff4d4f" : "#eee",
                  color: isHoliday ? "#fff" : "#000",
                  borderRadius: "6px",
                  fontSize: "12px"
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid px-2 px-md-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-3">Holidays</h4>
        <BackButton />
      </div>

      {/* ADD FORM */}
      <form onSubmit={addHoliday} className="row g-2 mb-4">
        <div className="col-md-4">
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Holiday Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="col-md-2">
          <button className="btn btn-primary w-100">Add</button>
        </div>
      </form>

      {/* MONTH VIEW */}
      {Object.keys(grouped).map((month) => (
        <div key={month} className="card p-3 mb-3">

          <div className="d-flex justify-content-between align-items-center">
            <h6 className="fw-bold">{month}</h6>

            <span
              className="text-primary"
              style={{ cursor: "pointer" }}
              onClick={() =>
                setSelectedMonth(selectedMonth === month ? null : month)
              }
            >
              📅 Calendar
            </span>
          </div>

          {/* HOLIDAYS LIST */}
          {grouped[month].map((h) => (
            <div
              key={h._id}
              className="d-flex justify-content-between mt-2"
            >
              <span>
                {new Date(h.date).toLocaleDateString()} — {h.name}
              </span>

              <button
                className="btn btn-sm btn-danger"
                onClick={() => deleteHoliday(h._id)}
              >
                Delete
              </button>
            </div>
          ))}

          {/* CALENDAR */}
          {selectedMonth === month && renderCalendar(month)}
        </div>
      ))}

    </div>
  );
};

export default Holidays