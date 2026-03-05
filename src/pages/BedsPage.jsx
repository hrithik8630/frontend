import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function BedsPage() {
  const { token } = useAuth();
  const [beds, setBeds] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    bedId: "",
    patientId: "",
    doctorId: "",
    startDate: "",
    endDate: "",
  });

  const loadBeds = async () => {
    try {
      const data = await apiRequest("/beds", { token });
      setBeds(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadBeds();
  }, []);

  const allocateBed = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const query = `?bedId=${form.bedId}&patientId=${form.patientId}&doctorId=${form.doctorId}&startDate=${form.startDate}&endDate=${form.endDate}`;

    try {
      const data = await apiRequest(`/beds/allocate${query}`, {
        method: "POST",
        token,
      });
      setMessage(`Bed request ${data.id} created with status ${data.status}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h1>Beds</h1>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="grid two-col">
        <article className="card">
          <h3>All Beds</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Bed No.</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {beds.map((bed) => (
                <tr key={bed.id}>
                  <td>{bed.id}</td>
                  <td>{bed.bedNumber}</td>
                  <td>{bed.type}</td>
                  <td>{bed.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card">
          <h3>Request Bed Allocation</h3>
          <form onSubmit={allocateBed} className="form-grid">
            <label>Bed ID<input type="number" required value={form.bedId} onChange={(e) => setForm((p) => ({ ...p, bedId: e.target.value }))} /></label>
            <label>Patient ID<input type="number" required value={form.patientId} onChange={(e) => setForm((p) => ({ ...p, patientId: e.target.value }))} /></label>
            <label>Doctor ID<input type="number" required value={form.doctorId} onChange={(e) => setForm((p) => ({ ...p, doctorId: e.target.value }))} /></label>
            <label>Start Date<input type="date" required value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} /></label>
            <label>End Date<input type="date" required value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} /></label>
            <button type="submit">Submit Request</button>
          </form>
        </article>
      </div>
    </section>
  );
}
