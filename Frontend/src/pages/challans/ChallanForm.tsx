import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import type { Customer, Product } from "../../types";
import "./Challans.css";

interface ChallanItem {
  productId: string;
  quantity: number;
}

const ChallanForm = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<ChallanItem[]>([{ productId: "", quantity: 1 }]);
  const [status, setStatus] = useState<"Draft" | "Confirmed">("Draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/customers?limit=100&status=Active"),
      api.get("/products?limit=100"),
    ]).then(([cRes, pRes]) => {
      setCustomers(cRes.data.customers);
      setProducts(pRes.data.products);
    }).catch(() => {});
  }, []);

  const addItem = () => setItems([...items, { productId: "", quantity: 1 }]);

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ChallanItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const getProduct = (productId: string) => products.find((p) => p._id === productId);

  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { setError("Please select a customer"); return; }
    if (items.some((item) => !item.productId)) { setError("Please select a product for each item"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await api.post("/challans", {
        customerId,
        items: items.map((item) => ({ productId: item.productId, quantity: Number(item.quantity) })),
        status,
      });
      navigate(`/challans/${res.data._id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to create challan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Create Challan</h2>
        <button className="btn-secondary" onClick={() => navigate("/challans")}>Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-card">
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label>Customer</label>
              <select className="input select" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.customerName} - {c.businessName}</option>
                ))}
              </select>
            </div>

            <div className="form-group form-group-full">
              <label>Status</label>
              <select className="input select" value={status} onChange={(e) => setStatus(e.target.value as "Draft" | "Confirmed")}>
                <option value="Draft">Draft</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="challan-items-header">
            <h3 className="detail-section-title">Products</h3>
            <button type="button" className="btn-secondary" onClick={addItem}>Add Item</button>
          </div>

          <div className="challan-items">
            {items.map((item, index) => {
              const product = getProduct(item.productId);
              return (
                <div key={index} className="challan-item-row">
                  <div className="form-group">
                    <label>Product</label>
                    <select
                      className="input select"
                      value={item.productId}
                      onChange={(e) => updateItem(index, "productId", e.target.value)}
                      required
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>{p.productName} ({p.sku}) - Stock: {p.currentStock}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      required
                    />
                  </div>

                  {product && (
                    <div className="form-group">
                      <label>Unit Price</label>
                      <input className="input" value={`Rs. ${product.unitPrice.toLocaleString()}`} disabled />
                    </div>
                  )}

                  {product && (
                    <div className="form-group">
                      <label>Subtotal</label>
                      <input className="input" value={`Rs. ${(product.unitPrice * Number(item.quantity)).toLocaleString()}`} disabled />
                    </div>
                  )}

                  <div className="form-group item-remove">
                    <label>&nbsp;</label>
                    <button type="button" className="btn-danger" onClick={() => removeItem(index)} disabled={items.length === 1}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="challan-total">
            <span>Total Quantity: <strong>{totalQuantity}</strong></span>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate("/challans")}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Challan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChallanForm;
