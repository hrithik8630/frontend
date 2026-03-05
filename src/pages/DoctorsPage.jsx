import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

function normalizeTime(value) {
  return (value || "").slice(0, 5);
}

export default function DoctorsPage() {
  const { token, role } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [slotForm, setSlotForm] = useState({ doctorId: "", date: "" });
  const [slots, setSlots] = useState([]);
  const [availabilityForm, setAvailabilityForm] = useState({ date: "", time: "" });
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [doctorForm, setDoctorForm] = useState({
    specialization: "",
    experience: 0,
    qualification: "",
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
    userId: "",
  });
  const [error, setError] = useState("");
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const loadDoctors = async () => {
    try {
      const data = await apiRequest("/doctors", { token });
      setDoctors(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const fetchSlots = async (e) => {
    e.preventDefault();
    setError("");
    setSlots([]);
    try {
      const data = await apiRequest(`/doctors/${slotForm.doctorId}/available-slots?date=${slotForm.date}`, { token });
      setSlots(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const findDoctorsBySlot = async (e) => {
    e.preventDefault();
    setError("");
    setAvailableDoctors([]);
    setLoadingAvailability(true);

    try {
      const targetTime = normalizeTime(availabilityForm.time);
      const availabilityChecks = await Promise.all(
        doctors.map(async (doctor) => {
          const doctorSlots = await apiRequest(
            `/doctors/${doctor.id}/available-slots?date=${availabilityForm.date}`,
            { token }
          );

          const isAvailable = doctorSlots.some((slot) => normalizeTime(slot) === targetTime);
          return isAvailable ? doctor : null;
        })
      );

      setAvailableDoctors(availabilityChecks.filter(Boolean));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const createDoctor = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await apiRequest("/doctors/create", {
        method: "POST",
        token,
        body: {
          specialization: doctorForm.specialization,
          experience: Number(doctorForm.experience),
          qualification: doctorForm.qualification,
          startTime: doctorForm.startTime,
          endTime: doctorForm.endTime,
          slotDuration: Number(doctorForm.slotDuration),
          user: { id: Number(doctorForm.userId) },
        },
      });
      await loadDoctors();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h1>Doctors</h1>
      {error && <p className="error">{error}</p>}

      <div className="grid two-col">
        <article className="card">
          <h3>All Doctors</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Specialization</th>
                <th>Qualification</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.id}</td>
                  <td>{doctor.user?.username || "N/A"}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.qualification || "N/A"}</td>
                  <td>{doctor.startTime} - {doctor.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        {role === "PATIENT" ? (
          <article className="card">
            <h3>Find Doctors by Slot</h3>
            <form onSubmit={findDoctorsBySlot} className="form-grid">
              <label>
                Date
                <input
                  type="date"
                  required
                  value={availabilityForm.date}
                  onChange={(e) => setAvailabilityForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </label>
              <label>
                Time
                <input
                  type="time"
                  required
                  value={availabilityForm.time}
                  onChange={(e) => setAvailabilityForm((prev) => ({ ...prev, time: e.target.value }))}
                />
              </label>
              <button type="submit" disabled={loadingAvailability}>
                {loadingAvailability ? "Checking..." : "Show Available Doctors"}
              </button>
            </form>

            <table>
              <thead>
                <tr>
                  <th>Doctor ID</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                </tr>
              </thead>
              <tbody>
                {availableDoctors.length === 0 && (
                  <tr>
                    <td colSpan="4" className="muted">No doctors available for selected slot.</td>
                  </tr>
                )}
                {availableDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>{doctor.id}</td>
                    <td>{doctor.user?.username || "N/A"}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.experience} years</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        ) : (
          <article className="card">
            <h3>Check Available Slots</h3>
            <form onSubmit={fetchSlots} className="form-grid">
              <label>
                Doctor ID
                <input
                  type="number"
                  required
                  value={slotForm.doctorId}
                  onChange={(e) => setSlotForm((prev) => ({ ...prev, doctorId: e.target.value }))}
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  required
                  value={slotForm.date}
                  onChange={(e) => setSlotForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </label>
              <button type="submit">Get Slots</button>
            </form>
            <div className="chips">
              {slots.map((slot) => <span className="chip" key={slot}>{slot}</span>)}
            </div>
          </article>
        )}
      </div>

      {role === "ADMIN" && (
        <article className="card">
          <h3>Create Doctor (Admin)</h3>
          <form onSubmit={createDoctor} className="grid three-col">
            <label>Specialization<input required value={doctorForm.specialization} onChange={(e) => setDoctorForm((p) => ({ ...p, specialization: e.target.value }))} /></label>
            <label>Experience<input type="number" value={doctorForm.experience} onChange={(e) => setDoctorForm((p) => ({ ...p, experience: e.target.value }))} /></label>
            <label>Qualification<input value={doctorForm.qualification} onChange={(e) => setDoctorForm((p) => ({ ...p, qualification: e.target.value }))} /></label>
            <label>Start Time<input type="time" value={doctorForm.startTime} onChange={(e) => setDoctorForm((p) => ({ ...p, startTime: e.target.value }))} /></label>
            <label>End Time<input type="time" value={doctorForm.endTime} onChange={(e) => setDoctorForm((p) => ({ ...p, endTime: e.target.value }))} /></label>
            <label>Slot Duration (mins)<input type="number" value={doctorForm.slotDuration} onChange={(e) => setDoctorForm((p) => ({ ...p, slotDuration: e.target.value }))} /></label>
            <label>User ID<input type="number" required value={doctorForm.userId} onChange={(e) => setDoctorForm((p) => ({ ...p, userId: e.target.value }))} /></label>
            <button type="submit">Create</button>
          </form>
        </article>
      )}
    </section>
  );
}
