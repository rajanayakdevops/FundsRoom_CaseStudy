import { useEffect, useState } from "react";
import api from "../../services/api";
import type { StockMovement, Product } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import "./Stock.css";

interface StockMovementForm {
  productId: string;
  quantityChanged: number;
  movementType: "IN" | "OUT";
  reason: string;
}

const StockPage = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [movementType, setMovementType] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const { user } = useAuth();
  const limit = 20;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StockMovementForm>();

  useEffect(() => {
    fetchMovements();
  }, [page, movementType]);

  useEffect(() => {
    if (showForm) fetchProducts();
  }, [showForm]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (movementType) params.append("movementType", movementType);
      const res = await api.get(`/stock?${params}`);
      setMovements(res.data.movements);
      setTotal(res.data.total);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products?limit=100");
      setProducts(res.data.products);
    } catch {
    }
  };

  const onSubmit = async (data: StockMovementForm) => {
    setFormLoading(true);
    setFormError("");
    try {
      await api.post("/stock", { ...data, quantityChanged: Number(data.quantityChanged) });
      reset();
      setShowForm(false);
      setPage(1);
      fetchMovements();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || "Failed to add movement");
    } finally {
      setFormLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Stock Movements</h2>
        {(user?.role === "admin" || user?.role === "warehouse") && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add Movement"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-card">
          <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
            <div className="form-group">
              <label>Product</label>
              <select className="input select" {...register("productId", { required: "Required" })}>
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.productName} ({p.sku}) - Stock: {p.currentStock}</option>
                ))}
              </select>
              {errors.productId && <span className="field-error">{errors.productId.message}</span>}
            </div>

            <div className="form-group">
              <label>Movement Type</label>
              <select className="input select" {...register("movementType", { required: "Required" })}>
                <option value="">Select type</option>
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
              </select>
              {errors.movementType && <span className="field-error">{errors.movementType.message}</span>}
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input className="input" type="number" min="1" {...register("quantityChanged", { required: "Required", min: { value: 1, message: "Min 1" } })} />
              {errors.quantityChanged && <span className="field-error">{errors.quantityChanged.message}</span>}
            </div>

            <div className="form-group">
              <label>Reason</label>
              <input className="input" {...register("reason", { required: "Required" })} placeholder="e.g. Purchase received" />
              {errors.reason && <span className="field-error">{errors.reason.message}</span>}
            </div>

            {formError && <div className="form-error form-group-full">{formError}</div>}

            <div className="form-actions form-group-full">
              <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); reset(); }}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? "Saving..." : "Add Movement"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filters-row">
        <select className="input select" value={movementType} onChange={(e) => { setMovementType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
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
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Created By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr><td colSpan={7} className="empty-row">No stock movements found</td></tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m._id}>
                      <td>{m.product?.productName}</td>
                      <td>{m.product?.sku}</td>
                      <td><span className={`badge badge-movement-${m.movementType.toLowerCase()}`}>{m.movementType}</span></td>
                      <td>{m.quantityChanged}</td>
                      <td>{m.reason}</td>
                      <td>{m.createdBy?.name}</td>
                      <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span className="pagination-info">Showing {movements.length} of {total}</span>
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

export default StockPage;
