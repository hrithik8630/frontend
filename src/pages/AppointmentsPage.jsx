import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

function normalizeTime(value) {
  return (value || "").slice(0, 5);
}

export default function AppointmentsPage() {
  const { token, role, email } = useAuth();
  const [bookForm, setBookForm] = useState({ doctorId: "", patientId: "", date: "", time: "" });
  const [historyPatientId, setHistoryPatientId] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [approveId, setApproveId] = useState("");
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDoctorAppointments = async () => {
    setError("");
    setMessage("");

    try {
      const doctors = await apiRequest("/doctors", { token });
      const matchedDoctor = doctors.find(
        (doctor) =>
          (doctor.user?.email || "").toLowerCase() === (email || "").toLowerCase()
      );

      if (!matchedDoctor) {
        throw new Error("Doctor profile not found for logged-in email");
      }

      setDoctorId(String(matchedDoctor.id));
      const data = await apiRequest(`/appointments/doctor/${matchedDoctor.id}`, { token });
      setDoctorAppointments(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (role === "DOCTOR") {
      loadDoctorAppointments();
    }
  }, [role, token, email]);

  const bookAppointment = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = await apiRequest("/appointments/book", {
        method: "POST",
        token,
        body: bookForm,
      });
      setMessage(`Booked appointment ${data.id} at ${normalizeTime(data.slotTime)}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadHistory = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await apiRequest(`/appointments/patient/${historyPatientId}`, { token });
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const approveAppointment = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = await apiRequest(`/appointments/${approveId}/approve`, {
        method: "PUT",
        token,
      });
      setMessage(`Appointment ${data.id} approved`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (role === "DOCTOR") {
    return (
      <section>
        <div className="page-header">
          <h1>Patients Module</h1>
          <button onClick={loadDoctorAppointments}>Refresh</button>
        </div>
        {doctorId && <p className="muted">Showing appointments for Doctor ID: {doctorId}</p>}
        {error && <p className="error">{error}</p>}

        <article className="card">
          <h3>Patients Who Booked With You</h3>
          <table>
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {doctorAppointments.length === 0 && (
                <tr>
                  <td colSpan="5" className="muted">No patient appointments found.</td>
                </tr>
              )}
              {doctorAppointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.id}</td>
                  <td>{appt.patientName}</td>
                  <td>{appt.appointmentDate}</td>
                  <td>{normalizeTime(appt.slotTime)}</td>
                  <td>{appt.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    );
  }

  return (
    <section>
      <h1>Appointments</h1>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="grid two-col">
        <article className="card">
          <h3>Book Appointment</h3>
          <form onSubmit={bookAppointment} className="form-grid">
            <label>Doctor ID<input type="number" required value={bookForm.doctorId} onChange={(e) => setBookForm((p) => ({ ...p, doctorId: e.target.value }))} /></label>
            <label>Patient ID<input type="number" required value={bookForm.patientId} onChange={(e) => setBookForm((p) => ({ ...p, patientId: e.target.value }))} /></label>
            <label>Date<input type="date" required value={bookForm.date} onChange={(e) => setBookForm((p) => ({ ...p, date: e.target.value }))} /></label>
            <label>Time<input type="time" required value={bookForm.time} onChange={(e) => setBookForm((p) => ({ ...p, time: e.target.value }))} /></label>
            <button type="submit">Book</button>
          </form>
        </article>

        <article className="card">
          <h3>Patient Appointment History</h3>
          <form onSubmit={loadHistory} className="inline-form">
            <input type="number" placeholder="Patient ID" required value={historyPatientId} onChange={(e) => setHistoryPatientId(e.target.value)} />
            <button type="submit">Load</button>
          </form>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.id}</td>
                  <td>{appt.doctorName}</td>
                  <td>{appt.appointmentDate}</td>
                  <td>{normalizeTime(appt.slotTime)}</td>
                  <td>{appt.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>

      {role === "ADMIN" && (
        <article className="card">
          <h3>Approve Appointment</h3>
          <form onSubmit={approveAppointment} className="inline-form">
            <input type="number" placeholder="Appointment ID" value={approveId} onChange={(e) => setApproveId(e.target.value)} required />
            <button type="submit">Approve</button>
          </form>
        </article>
      )}
    </section>
  );
}
