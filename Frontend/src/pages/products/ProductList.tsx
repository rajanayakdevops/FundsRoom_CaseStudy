import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import type { Product } from "../../types";
import { useAuth } from "../../context/AuthContext";
import "./Products.css";

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const limit = 20;

  useEffect(() => {
    fetchProducts();
  }, [page, category]);

  const fetchProducts = async (searchVal = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (searchVal) params.append("search", searchVal);
      if (category) params.append("category", category);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(search);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Products</h2>
        {(user?.role === "admin" || user?.role === "warehouse") && (
          <button className="btn-primary" onClick={() => navigate("/products/new")}>Add Product</button>
        )}
      </div>

      <div className="filters-row">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name, SKU, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
          <button type="submit" className="btn-secondary">Search</button>
        </form>
        <input
          type="text"
          placeholder="Filter by category"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="input"
        />
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
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock</th>
                  <th>Min Alert</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={8} className="empty-row">No products found</td></tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p._id}
                      className="clickable-row"
                      onClick={() => (user?.role === "admin" || user?.role === "warehouse") && navigate(`/products/${p._id}/edit`)}
                    >
                      <td>{p.productName}</td>
                      <td>{p.sku}</td>
                      <td>{p.category}</td>
                      <td>Rs. {p.unitPrice.toLocaleString()}</td>
                      <td>
                        <span className={p.currentStock <= p.minimumStockAlert ? "low-stock" : ""}>
                          {p.currentStock}
                        </span>
                      </td>
                      <td>{p.minimumStockAlert}</td>
                      <td>{p.location}</td>
                      <td>
                        <span className={`badge ${p.currentStock <= p.minimumStockAlert ? "badge-inactive" : "badge-active"}`}>
                          {p.currentStock <= p.minimumStockAlert ? "Low Stock" : "OK"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span className="pagination-info">Showing {products.length} of {total}</span>
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

export default ProductList;
