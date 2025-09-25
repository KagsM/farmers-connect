import React, { useEffect, useState } from "react";
import FarmersSearchBar from "../components/farmersSearchBar";
import ProductForm from "../components/productForm";
import FarmersCard from "../components/farmersCard";
import Sidebar from "../components/sidebar";

function Farmers() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch products from backend
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/products/${id}`, {
        method: "DELETE",
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleSubmit = (savedProduct) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
      );
      setEditingProduct(null);
    } else {
      setProducts((prev) => [...prev, savedProduct]);
    }
  };

  return (
    <div className="farmers-page" style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar />

      <div className="farmers-content" style={{ flex: 1, padding: "0 20px" }}>
        <h1>Farmer's Hub</h1>

        <ProductForm
          initialData={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => setEditingProduct(null)}
        />

        <FarmersSearchBar />

        <div className="product-list">
          {products.length === 0 ? (
            <p>No products available.</p>
          ) : (
            products.map((product) => (
              <FarmersCard
                key={product.id}
                product={product}
                onEdit={() => handleEdit(product)}
                onDelete={() => handleDelete(product.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Farmers;