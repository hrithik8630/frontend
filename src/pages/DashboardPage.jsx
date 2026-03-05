import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { role, token } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "PATIENT") {
      return;
    }

    const loadDoctors = async () => {
      try {
        const data = await apiRequest("/doctors", { token });
        setDoctors(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadDoctors();
  }, [role, token]);

  return (
    <section>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="muted">Signed in as <strong>{role}</strong></p>
      </div>
      {error && <p className="error">{error}</p>}

      {role === "DOCTOR" && (
        <div className="grid cards">
          <article className="card">
            <h3>Patients Module</h3>
            <p>Manage patient appointments, review status, and approve requests.</p>
            <Link className="text-link" to="/appointments">Open patients module</Link>
          </article>
          <article className="card">
            <h3>Bed Module</h3>
            <p>View current bed inventory and create new bed allocation requests.</p>
            <Link className="text-link" to="/beds">Open bed module</Link>
          </article>
        </div>
      )}

      {role === "PATIENT" && (
        <article className="card">
          <h3>Available Doctors and Specifications</h3>
          <p className="muted">Review doctor specialization, qualifications, and working hours before booking.</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Specialization</th>
                <th>Qualification</th>
                <th>Experience</th>
                <th>Timing</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 && (
                <tr>
                  <td colSpan="6" className="muted">No doctors available.</td>
                </tr>
              )}
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.id}</td>
                  <td>{doctor.user?.username || "N/A"}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.qualification || "N/A"}</td>
                  <td>{doctor.experience} years</td>
                  <td>{doctor.startTime} - {doctor.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      {role === "ADMIN" && (
        <div className="grid cards">
          <article className="card">
            <h3>Doctors</h3>
            <p>Manage doctor profiles and available slots.</p>
            <Link className="text-link" to="/doctors">Go to doctors</Link>
          </article>
          <article className="card">
            <h3>Appointments</h3>
            <p>Track and approve appointment activity.</p>
            <Link className="text-link" to="/appointments">Go to appointments</Link>
          </article>
          <article className="card">
            <h3>Beds and Requests</h3>
            <p>Review bed status and approve bed allocation requests.</p>
            <Link className="text-link" to="/admin/bed-requests">Go to bed requests</Link>
          </article>
        </div>
      )}
    </section>
  );
}
