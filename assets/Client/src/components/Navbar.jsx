import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ display: "flex", gap: "20px", padding: "10px", background: "#f5f5f5" }}>
      <Link to="/">Dashboard</Link>
      <Link to="/habits">Habit Tracker</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </nav>
  );
}

export default Navbar;
