import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import type { Challan } from "../../types";
import { useAuth } from "../../context/AuthContext";
import "./Challans.css";

const ChallanList = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const limit = 20;

  useEffect(() => {
    fetchChallans();
  }, [page, status]);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) params.append("status", status);
      const res = await api.get(`/challans?${params}`);
      setChallans(res.data.challans);
      setTotal(res.data.total);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Challans</h2>
        {(user?.role === "admin" || user?.role === "sales") && (
          <button className="btn-primary" onClick={() => navigate("/challans/new")}>Create Challan</button>
        )}
      </div>

      <div className="filters-row">
        <select className="input select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
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
                  <th>Challan No.</th>
                  <th>Customer</th>
                  <th>Business</th>
                  <th>Total Qty</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {challans.length === 0 ? (
                  <tr><td colSpan={7} className="empty-row">No challans found</td></tr>
                ) : (
                  challans.map((c) => (
                    <tr key={c._id} className="clickable-row" onClick={() => navigate(`/challans/${c._id}`)}>
                      <td>{c.challanNumber}</td>
                      <td>{c.customer?.customerName}</td>
                      <td>{c.customer?.businessName}</td>
                      <td>{c.totalQuantity}</td>
                      <td><span className={`badge badge-challan-${c.status.toLowerCase()}`}>{c.status}</span></td>
                      <td>{c.createdBy?.name}</td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span className="pagination-info">Showing {challans.length} of {total}</span>
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

export default ChallanList;
