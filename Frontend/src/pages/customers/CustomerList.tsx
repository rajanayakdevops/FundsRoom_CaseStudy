import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Customer } from "../../types";
import { useAuth } from "../../context/AuthContext";
import "./Customers.css";

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const limit = 20;

  useEffect(() => {
    fetchCustomers();
  }, [page, status, customerType]);

  const fetchCustomers = async (searchVal = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (searchVal) params.append("search", searchVal);
      if (status) params.append("status", status);
      if (customerType) params.append("customerType", customerType);
      const res = await api.get(`/customers?${params}`);
      setCustomers(res.data.customers);
      setTotal(res.data.total);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers(search);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Customers</h2>
        {(user?.role === "admin" || user?.role === "sales") && (
          <button className="btn-primary" onClick={() => navigate("/customers/new")}>Add Customer</button>
        )}
      </div>

      <div className="filters-row">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name, business, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
          <button type="submit" className="btn-secondary">Search</button>
        </form>
        <select className="input select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="Lead">Lead</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select className="input select" value={customerType} onChange={(e) => { setCustomerType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="Retail">Retail</option>
          <option value="Wholesale">Wholesale</option>
          <option value="Distributor">Distributor</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Business</th>
                  <th>Mobile</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={6} className="empty-row">No customers found</td></tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c._id} className="clickable-row" onClick={() => navigate(`/customers/${c._id}`)}>
                      <td>{c.customerName}</td>
                      <td>{c.businessName}</td>
                      <td>{c.mobileNumber}</td>
                      <td>{c.customerType}</td>
                      <td><span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span></td>
                      <td>{c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span className="pagination-info">Showing {customers.length} of {total}</span>
            <div className="pagination-controls">
              <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
              <span className="pagination-page">{page} / {totalPages || 1}</span>
              <button className="btn-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerList;
