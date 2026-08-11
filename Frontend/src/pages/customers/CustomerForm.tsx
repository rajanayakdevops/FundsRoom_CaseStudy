import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import type { CustomerFormData } from "../../types";
import "./Customers.css";

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormData>();

  useEffect(() => {
    if (isEdit) {
      api.get(`/customers/${id}`).then((res) => reset(res.data)).catch(() => navigate("/customers"));
    }
  }, [id]);

  const onSubmit = async (data: CustomerFormData) => {
    setLoading(true);
    setError("");
    try {
      if (isEdit) {
        await api.put(`/customers/${id}`, data);
        navigate(`/customers/${id}`);
      } else {
        const res = await api.post("/customers", data);
        navigate(`/customers/${res.data._id}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">{isEdit ? "Edit Customer" : "Add Customer"}</h2>
        <button className="btn-secondary" onClick={() => navigate("/customers")}>Back</button>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
          <div className="form-group">
            <label>Customer Name</label>
            <input className="input" {...register("customerName", { required: "Required" })} />
            {errors.customerName && <span className="field-error">{errors.customerName.message}</span>}
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input className="input" {...register("mobileNumber", { required: "Required" })} />
            {errors.mobileNumber && <span className="field-error">{errors.mobileNumber.message}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" {...register("email", { required: "Required" })} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Business Name</label>
            <input className="input" {...register("businessName", { required: "Required" })} />
            {errors.businessName && <span className="field-error">{errors.businessName.message}</span>}
          </div>

          <div className="form-group">
            <label>GST Number <span className="optional">(optional)</span></label>
            <input className="input" {...register("gstNumber")} />
          </div>

          <div className="form-group">
            <label>Customer Type</label>
            <select className="input select" {...register("customerType", { required: "Required" })}>
              <option value="">Select type</option>
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Distributor">Distributor</option>
            </select>
            {errors.customerType && <span className="field-error">{errors.customerType.message}</span>}
          </div>

          <div className="form-group">
            <label>Status</label>
            <select className="input select" {...register("status", { required: "Required" })}>
              <option value="">Select status</option>
              <option value="Lead">Lead</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {errors.status && <span className="field-error">{errors.status.message}</span>}
          </div>

          <div className="form-group">
            <label>Follow-up Date</label>
            <input className="input" type="date" {...register("followUpDate")} />
          </div>

          <div className="form-group form-group-full">
            <label>Address</label>
            <textarea className="input textarea" rows={2} {...register("address", { required: "Required" })} />
            {errors.address && <span className="field-error">{errors.address.message}</span>}
          </div>

          <div className="form-group form-group-full">
            <label>Notes <span className="optional">(optional)</span></label>
            <textarea className="input textarea" rows={3} {...register("notes")} />
          </div>

          {error && <div className="form-error form-group-full">{error}</div>}

          <div className="form-actions form-group-full">
            <button type="button" className="btn-secondary" onClick={() => navigate("/customers")}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Customer" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
