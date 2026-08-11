import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left"></div>
      <div className="navbar-right">
        <span className="navbar-user">{user?.name}</span>
        <span className="navbar-role">{user?.role}</span>
        <button className="navbar-logout" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Navbar;
