import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { role, email, logout } = useAuth();
  const navClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;

  return (
    <header className="nav-wrap">
      <nav className="nav">
        <div className="nav-left">
          <span className="brand">Hospital Frontend</span>
          <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
          {role === "PATIENT" && <NavLink to="/doctors" className={navClass}>Doctors</NavLink>}
          {role === "DOCTOR" && (
            <>
              <NavLink to="/appointments" className={navClass}>Patients Module</NavLink>
              <NavLink to="/beds" className={navClass}>Beds</NavLink>
            </>
          )}
          {role === "ADMIN" && (
            <>
              <NavLink to="/doctors" className={navClass}>Doctors</NavLink>
              <NavLink to="/appointments" className={navClass}>Appointments</NavLink>
              <NavLink to="/beds" className={navClass}>Beds</NavLink>
              <NavLink to="/admin/bed-requests" className={navClass}>Admin Requests</NavLink>
            </>
          )}
        </div>
        <div className="nav-right">
          <span className="badge">{role}</span>
          <span className="muted">{email}</span>
          <button onClick={logout} className="secondary-btn">Logout</button>
        </div>
      </nav>
    </header>
  );
}
