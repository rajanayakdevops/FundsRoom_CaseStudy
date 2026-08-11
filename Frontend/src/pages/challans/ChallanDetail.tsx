import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import type { Challan } from "../../types";
import { useAuth } from "../../context/AuthContext";
import "./Challans.css";

const ChallanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const fetchChallan = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/challans/${id}`);
      setChallan(res.data);
    } catch {
      navigate("/challans");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    setStatusLoading(true);
    setError("");
    try {
      await api.patch(`/challans/${id}/status`, { status });
      fetchChallan();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <p className="loading-text">Loading...</p>;
  if (!challan) return null;

  const canModify = (user?.role === "admin" || user?.role === "sales") && challan.status === "Draft";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">{challan.challanNumber}</h2>
          <p className="page-subtitle">{new Date(challan.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="header-actions">
          {canModify && (
            <>
              <button
                className="btn-primary"
                disabled={statusLoading}
                onClick={() => handleStatusUpdate("Confirmed")}
              >
                {statusLoading ? "Updating..." : "Confirm"}
              </button>
              <button
                className="btn-danger"
                disabled={statusLoading}
                onClick={() => handleStatusUpdate("Cancelled")}
              >
                Cancel Challan
              </button>
            </>
          )}
          <button className="btn-secondary" onClick={() => navigate("/challans")}>Back</button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="detail-grid">
        <div className="detail-card">
          <h3 className="detail-section-title">Challan Info</h3>
          <div className="detail-rows">
            <div className="detail-row"><span className="detail-label">Status</span><span className={`badge badge-challan-${challan.status.toLowerCase()}`}>{challan.status}</span></div>
            <div className="detail-row"><span className="detail-label">Customer</span><span>{challan.customer?.customerName}</span></div>
            <div className="detail-row"><span className="detail-label">Business</span><span>{challan.customer?.businessName}</span></div>
            <div className="detail-row"><span className="detail-label">Mobile</span><span>{challan.customer?.mobileNumber}</span></div>
            <div className="detail-row"><span className="detail-label">Email</span><span>{challan.customer?.email}</span></div>
            <div className="detail-row"><span className="detail-label">Created By</span><span>{challan.createdBy?.name}</span></div>
            <div className="detail-row"><span className="detail-label">Total Qty</span><span>{challan.totalQuantity}</span></div>
          </div>
        </div>

        <div className="detail-card">
          <h3 className="detail-section-title">Products</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.productName}</td>
                  <td>{item.sku}</td>
                  <td>Rs. {item.unitPrice.toLocaleString()}</td>
                  <td>{item.quantity}</td>
                  <td>Rs. {(item.unitPrice * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChallanDetail;
