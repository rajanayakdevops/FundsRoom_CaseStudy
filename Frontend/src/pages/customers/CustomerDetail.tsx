import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Customer } from "../../types";
import { useAuth } from "../../context/AuthContext";
import "./Customers.css";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState("");

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data);
    } catch {
      navigate("/customers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setNoteLoading(true);
    setNoteError("");
    try {
      await api.post(`/customers/${id}/follow-up`, { note });
      setNote("");
      fetchCustomer();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setNoteError(error.response?.data?.message || "Failed to add note");
    } finally {
      setNoteLoading(false);
    }
  };

  if (loading) return <p className="loading-text">Loading...</p>;
  if (!customer) return null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">{customer.customerName}</h2>
          <p className="page-subtitle">{customer.businessName}</p>
        </div>
        <div className="header-actions">
          {(user?.role === "admin" || user?.role === "sales") && (
            <button className="btn-secondary" onClick={() => navigate(`/customers/${id}/edit`)}>Edit</button>
          )}
          <button className="btn-secondary" onClick={() => navigate("/customers")}>Back</button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3 className="detail-section-title">Customer Info</h3>
          <div className="detail-rows">
            <div className="detail-row"><span className="detail-label">Mobile</span><span>{customer.mobileNumber}</span></div>
            <div className="detail-row"><span className="detail-label">Email</span><span>{customer.email}</span></div>
            <div className="detail-row"><span className="detail-label">Type</span><span>{customer.customerType}</span></div>
            <div className="detail-row"><span className="detail-label">Status</span><span className={`badge badge-${customer.status.toLowerCase()}`}>{customer.status}</span></div>
            <div className="detail-row"><span className="detail-label">GST</span><span>{customer.gstNumber || "-"}</span></div>
            <div className="detail-row"><span className="detail-label">Address</span><span>{customer.address}</span></div>
            <div className="detail-row"><span className="detail-label">Follow-up</span><span>{customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : "-"}</span></div>
            <div className="detail-row"><span className="detail-label">Notes</span><span>{customer.notes || "-"}</span></div>
            <div className="detail-row"><span className="detail-label">Created by</span><span>{customer.createdBy?.name}</span></div>
          </div>
        </div>

        <div className="detail-card">
          <h3 className="detail-section-title">Follow-up Notes</h3>
          {(user?.role === "admin" || user?.role === "sales") && (
            <form onSubmit={handleAddNote} className="note-form">
              <textarea
                className="input textarea"
                placeholder="Add a follow-up note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
              {noteError && <p className="field-error">{noteError}</p>}
              <button type="submit" className="btn-primary" disabled={noteLoading}>
                {noteLoading ? "Adding..." : "Add Note"}
              </button>
            </form>
          )}
          <div className="notes-list">
            {customer.followUpNotes.length === 0 ? (
              <p className="empty-text">No follow-up notes yet</p>
            ) : (
              [...customer.followUpNotes].reverse().map((n) => (
                <div key={n._id} className="note-item">
                  <p className="note-text">{n.note}</p>
                  <p className="note-meta">{n.createdBy?.name} &middot; {new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
