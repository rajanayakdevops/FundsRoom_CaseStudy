import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import type { ProductFormData } from "../../types";
import "./Products.css";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>();

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then((res) => reset(res.data)).catch(() => navigate("/products"));
    }
  }, [id]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...data,
        unitPrice: Number(data.unitPrice),
        currentStock: Number(data.currentStock),
        minimumStockAlert: Number(data.minimumStockAlert),
      };
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      navigate("/products");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">{isEdit ? "Edit Product" : "Add Product"}</h2>
        <button className="btn-secondary" onClick={() => navigate("/products")}>Back</button>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
          <div className="form-group">
            <label>Product Name</label>
            <input className="input" {...register("productName", { required: "Required" })} />
            {errors.productName && <span className="field-error">{errors.productName.message}</span>}
          </div>

          <div className="form-group">
            <label>SKU / Code</label>
            <input className="input" {...register("sku", { required: "Required" })} />
            {errors.sku && <span className="field-error">{errors.sku.message}</span>}
          </div>

          <div className="form-group">
            <label>Category</label>
            <input className="input" {...register("category", { required: "Required" })} />
            {errors.category && <span className="field-error">{errors.category.message}</span>}
          </div>

          <div className="form-group">
            <label>Unit Price (Rs.)</label>
            <input className="input" type="number" min="0" step="0.01" {...register("unitPrice", { required: "Required", min: { value: 0, message: "Must be positive" } })} />
            {errors.unitPrice && <span className="field-error">{errors.unitPrice.message}</span>}
          </div>

          <div className="form-group">
            <label>Current Stock</label>
            <input className="input" type="number" min="0" {...register("currentStock", { required: "Required", min: { value: 0, message: "Must be positive" } })} />
            {errors.currentStock && <span className="field-error">{errors.currentStock.message}</span>}
          </div>

          <div className="form-group">
            <label>Minimum Stock Alert</label>
            <input className="input" type="number" min="0" {...register("minimumStockAlert", { required: "Required", min: { value: 0, message: "Must be positive" } })} />
            {errors.minimumStockAlert && <span className="field-error">{errors.minimumStockAlert.message}</span>}
          </div>

          <div className="form-group">
            <label>Location / Warehouse</label>
            <input className="input" {...register("location", { required: "Required" })} />
            {errors.location && <span className="field-error">{errors.location.message}</span>}
          </div>

          {error && <div className="form-error form-group-full">{error}</div>}

          <div className="form-actions form-group-full">
            <button type="button" className="btn-secondary" onClick={() => navigate("/products")}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
