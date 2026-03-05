import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AdminBedRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    try {
      const data = await apiRequest("/admin/bed-requests", { token });
      setRequests(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const approveRequest = async (id) => {
    setError("");
    setMessage("");

    try {
      await apiRequest(`/admin/bed-requests/${id}/approve`, {
        method: "PUT",
        token,
      });
      setMessage(`Request ${id} approved`);
      await loadRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h1>Admin Bed Requests</h1>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <article className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Bed</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Dates</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.bed?.bedNumber || req.bed?.id}</td>
                <td>{req.patient?.username || req.patient?.id}</td>
                <td>{req.approvedBy?.user?.username || req.approvedBy?.id}</td>
                <td>{req.startDate} to {req.endDate}</td>
                <td>{req.status}</td>
                <td>
                  <button onClick={() => approveRequest(req.id)} disabled={req.status === "APPROVED"}>Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
