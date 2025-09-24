// import React, { useState, useEffect } from "react";
// import FarmersSearchBar from "../components/farmersSearchBar";
// import ProductForm from "../components/productForm";
// import FarmersCard from "../components/farmersCard";
// import Sidebar from "../components/sidebar";
// import { db, ref, onValue, remove, update } from "../api/firebase";
// import { auth } from "../api/firebase";
// import { onAuthStateChanged } from "firebase/auth";

// function FarmersHub() {
//   const [products, setProducts] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [searchText, setSearchText] = useState("");
//   const [user, setUser] = useState(null);
//   const [userProfile, setUserProfile] = useState(null);

//   // Track current user
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
//       setUser(firebaseUser);
//       if (firebaseUser) {
//         const userRef = ref(db, `products/${firebaseUser.postedBy}`);
//         onValue(userRef, (snapshot) => {
//           setUserProfile(snapshot.val());
//         });
//       } else {
//         setUserProfile(null);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   // Fetch all products from Firebase
//   useEffect(() => {
//     const productsRef = ref(db, "products");
//     const unsubscribe = onValue(productsRef, (snapshot) => {
//       const data = snapshot.val();
//       const productsArray = data
//         ? Object.entries(data).map(([id, value]) => ({ id, ...value }))
//         : [];
//       setProducts(productsArray);
//     });
//     return () => unsubscribe();
//   }, []);

//   // Filter products to only those posted by the current user
//   useEffect(() => {
//     if (!user) {
//       setFiltered([]);
//       return;
//     }
//     let updated = products.filter(
//       (product) =>
//         product.postedBy === (user.displayName || user.email)
//     );

//     // Search filter
//     if (searchText) {
//       updated = updated.filter(product =>
//         product.name.toLowerCase().includes(searchText.toLowerCase()) ||
//         (product.location && product.location.toLowerCase().includes(searchText.toLowerCase()))
//       );
//     }

//     setFiltered(updated);
//   }, [products, user, searchText]);

//   // Add product (handled by ProductForm, which writes to Firebase)
//   async function handleAddProduct() {
//     try{
//         const response = await fetch ("http://127.0.0.1:5000/inventory",{
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(formData),
//         });
//         if (!response.ok){
//             alert("Failed to add product. Please try again.");
//             return;
//         }
//         const newProduct = await response.json();
//         alert("Product added successfully!");

//         setProducts((prev) => [...prev, newProduct]);
//         setEditingProduct(null);
//     } catch (error){
//         console.error("Error adding product:", error);
//         alert("An error occurred. Please try again.");
//     }
//   }

//   // Update product in Firebase
//   async function handleUpdateProduct(updatedProduct) {
//     if (!updatedProduct.id) return;
//     const productRef = ref(db, `products/${updatedProduct.id}`);
//     await update(productRef, updatedProduct);
//     setEditingProduct(null);
//   }

//   // Delete product in Firebase
//   async function handleDeleteProduct(id) {
//     if (!id) return;
//     const productRef = ref(db, `products/${id}`);
//     await remove(productRef);
//   }

//   if (userProfile && !userProfile.verified) {
//     return (
//       <div className="main-content">
//         <h2>Access Denied</h2>
//         <p>You must be a <b>verified farmer</b> to post produce. Please contact admin.</p>
//       </div>
//     );
//   }

//   else return (
//     <div className="home-container">
//       <Sidebar />
//       <div className="main-content">
//         <h1> Welcome to the Farmers Hub! </h1>
//         <p> Post your products here and connect with buyers across the country. </p>
//         <p> To join our community of verified and trusted farmers, email us at verifyme@farmershub.com </p>
//         {/* Show add form only if not editing */}
//         {!editingProduct && (
//           <ProductForm onSubmit={handleAddProduct} />
//         )}
//         {/* FarmersSearchBar for filtering */}
//         <h1>Your Products</h1>
//         <FarmersSearchBar
//           products={products}
//           onSearch={setSearchText}
//         />
//         <div className="farmer-product-grid">
//           {filtered.length === 0 ? (
//             <p>No products found.</p>
//           ) : (
//             filtered.map((product) =>
//               editingProduct && editingProduct.id === product.id ? (
//                 <ProductForm
//                   key={product.id}
//                   initialData={editingProduct}
//                   onSubmit={handleUpdateProduct}
//                   onCancel={() => setEditingProduct(null)}
//                 />
//               ) : (
//                 <FarmersCard
//                   key={product.id}
//                   product={product}
//                   onDelete={() => handleDeleteProduct(product.id)}
//                   onEdit={() => setEditingProduct(product)}
//                 />
//               )
//             )
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default FarmersHub;

import React, { useState, useEffect } from "react";
import FarmersSearchBar from "../components/farmersSearchBar";
import ProductForm from "../components/productForm";
import FarmersCard from "../components/farmersCard";
import Sidebar from "../components/sidebar";
import { auth } from "../api/firebase"; // keep only auth for login
import { onAuthStateChanged } from "firebase/auth";

function FarmersHub() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Track current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setUserProfile({ email: firebaseUser.email, verified: true }); 
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch products from Flask API instead of Firebase
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://127.0.0.1:5000/inventory");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }
    fetchProducts();
  }, []);

  // ✅ Filter products to only those posted by the current user
  useEffect(() => {
    if (!user) {
      setFiltered([]);
      return;
    }
    let updated = products.filter(
      (product) =>
        product.contact_info === (user.displayName || user.email)
    );

    if (searchText) {
      updated = updated.filter(product =>
        product.product_name.toLowerCase().includes(searchText.toLowerCase()) ||
        (product.location && product.location.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    setFiltered(updated);
  }, [products, user, searchText]);

  // ✅ Add product → POST to Flask API
  async function handleAddProduct(formData) {
    try {
      const response = await fetch("http://127.0.0.1:5000/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        alert("Failed to add product. Please try again.");
        return;
      }

      const newProduct = await response.json();
      alert("Product added successfully!");
      setProducts((prev) => [...prev, newProduct]);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("An error occurred. Please try again.");
    }
  }

  // ✅ Update product → PUT request
  async function handleUpdateProduct(updatedProduct) {
    try {
      const response = await fetch(`http://127.0.0.1:5000/inventory/${updatedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) throw new Error("Failed to update product");

      const data = await response.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === data.id ? data : p))
      );
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  }

  // ✅ Delete product → DELETE request
  async function handleDeleteProduct(id) {
    try {
      const response = await fetch(`http://127.0.0.1:5000/inventory/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  if (userProfile && !userProfile.verified) {
    return (
      <div className="main-content">
        <h2>Access Denied</h2>
        <p>You must be a <b>verified farmer</b> to post produce. Please contact admin.</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content">
        <h1> Welcome to the Farmers Hub! </h1>
        <p> Post your products here and connect with buyers across the country. </p>
        <p> To join our community of verified and trusted farmers, email us at verifyme@farmershub.com </p>
        
        {!editingProduct && (
          <ProductForm onSubmit={handleAddProduct} />
        )}

        <h1>Your Products</h1>
        <FarmersSearchBar
          products={products}
          onSearch={setSearchText}
        />

        <div className="farmer-product-grid">
          {filtered.length === 0 ? (
            <p>No products found.</p>
          ) : (
            filtered.map((product) =>
              editingProduct && editingProduct.id === product.id ? (
                <ProductForm
                  key={product.id}
                  initialData={editingProduct}
                  onSubmit={handleUpdateProduct}
                  onCancel={() => setEditingProduct(null)}
                />
              ) : (
                <FarmersCard
                  key={product.id}
                  product={product}
                  onDelete={() => handleDeleteProduct(product.id)}
                  onEdit={() => setEditingProduct(product)}
                />
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default FarmersHub;
