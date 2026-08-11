import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const navItems = [
  { label: "Dashboard", path: "/", roles: ["admin", "sales", "warehouse", "accounts"] },
  { label: "Customers", path: "/customers", roles: ["admin", "sales", "accounts"] },
  { label: "Products", path: "/products", roles: ["admin", "sales", "warehouse", "accounts"] },
  { label: "Stock", path: "/stock", roles: ["admin", "warehouse", "accounts"] },
  { label: "Challans", path: "/challans", roles: ["admin", "sales", "accounts"] },
];

const Sidebar = () => {
  const { user } = useAuth();

  const filtered = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">ERP Portal</div>
      <nav className="sidebar-nav">
        {filtered.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
