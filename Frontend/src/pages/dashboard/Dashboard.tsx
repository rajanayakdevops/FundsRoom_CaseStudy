import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalChallans: number;
  draftChallans: number;
  confirmedChallans: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalChallans: 0,
    draftChallans: 0,
    confirmedChallans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customers, products, lowStock, challans, draftChallans, confirmedChallans] = await Promise.all([
          api.get("/customers?limit=1"),
          api.get("/products?limit=1"),
          api.get("/products/low-stock"),
          api.get("/challans?limit=1"),
          api.get("/challans?status=Draft&limit=1"),
          api.get("/challans?status=Confirmed&limit=1"),
        ]);

        setStats({
          totalCustomers: customers.data.total,
          totalProducts: products.data.total,
          lowStockProducts: lowStock.data.length,
          totalChallans: challans.data.total,
          draftChallans: draftChallans.data.total,
          confirmedChallans: confirmedChallans.data.total,
        });
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Customers", value: stats.totalCustomers, roles: ["admin", "sales", "accounts"] },
    { label: "Total Products", value: stats.totalProducts, roles: ["admin", "sales", "warehouse", "accounts"] },
    { label: "Low Stock Items", value: stats.lowStockProducts, roles: ["admin", "warehouse", "sales"] },
    { label: "Total Challans", value: stats.totalChallans, roles: ["admin", "sales", "accounts"] },
    { label: "Draft Challans", value: stats.draftChallans, roles: ["admin", "sales", "accounts"] },
    { label: "Confirmed Challans", value: stats.confirmedChallans, roles: ["admin", "sales", "accounts"] },
  ];

  const visibleCards = statCards.filter((card) => user && card.roles.includes(user.role));

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Welcome back, {user?.name}</p>
      </div>
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <div className="stats-grid">
          {visibleCards.map((card) => (
            <div key={card.label} className="stat-card">
              <p className="stat-label">{card.label}</p>
              <p className="stat-value">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
