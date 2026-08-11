import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { AuthResponse } from "../../types";
import "./Login.css";

interface LoginForm {
  email: string;
  password: string;
}

const demoUsers = [
  { role: "Admin", email: "admin@erp.com" },
  { role: "Sales", email: "sales@erp.com" },
  { role: "Warehouse", email: "warehouse@erp.com" },
  { role: "Accounts", email: "accounts@erp.com" },
];

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const fillDemo = (email: string) => {
    setValue("email", email);
    setValue("password", "password123");
    setError("");
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post<AuthResponse>("/auth/login", data);
      login({ _id: res.data._id, name: res.data.name, email: res.data.email, role: res.data.role, isActive: true }, res.data.token);
      navigate("/");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-header">
          <div className="login-badge">Wholesale Operations</div>
          <h1 className="login-title">Mini ERP + CRM</h1>
          <p className="login-subtitle">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="input"
              {...register("email", { required: "Email is required" })}
              placeholder="e.g. admin@erp.com"
            />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="input"
              {...register("password", { required: "Password is required" })}
              placeholder="Enter password"
            />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="demo-credentials">
          <p className="demo-title">Quick Demo Login (1-Click)</p>
          <div className="demo-grid">
            {demoUsers.map((u) => (
              <button
                key={u.role}
                type="button"
                className="demo-btn"
                onClick={() => fillDemo(u.email)}
              >
                <span className="demo-role">{u.role}</span>
                <span className="demo-email">{u.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
