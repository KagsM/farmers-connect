// import React, { useState, useEffect } from "react";
// import ProductCard from "../components/productCard";
// import ProductSidebar from "../components/productSideBar";
// import '../styles/components.css';
// import { db, ref, onValue } from "../api/firebase";

// function Marketplace() {
//     const [products, setProducts] = useState([]);
//     const [filtered, setFiltered] = useState([]);
//     const [searchText, setSearchText] = useState("");
//     const [filters, setFilters] = useState({
//         price: "",
//         location: "",
//         category: ""
//     });

//     // Fetch products from Firebase Realtime Database
//     useEffect(() => {
//         const productsRef = ref(db, "products");
//         const unsubscribe = onValue(productsRef, (snapshot) => {
//             const data = snapshot.val();
//             const productsArray = data
//                 ? Object.entries(data).map(([id, value]) => ({ id, ...value }))
//                 : [];
//             setProducts(productsArray);
//             setFiltered(productsArray);
//         });
//         return () => unsubscribe();
//     }, []);

//     useEffect(() => {
//         let updated = [...products];

//         // Search filter
//         if (searchText) {
//             updated = updated.filter(product =>
//                 product.name.toLowerCase().includes(searchText.toLowerCase()) ||
//                 (product.location && product.location.toLowerCase().includes(searchText.toLowerCase()))
//             );
//         }

//         // Price filter
//         if (filters.price) {
//             updated = updated.filter(product =>
//                 Number(product.price) <= Number(filters.price)
//             );
//         }

//         // Location filter
//         if (filters.location) {
//             updated = updated.filter(product =>
//                 product.location === filters.location
//             );
//         }

//         // Category filter
//         if (filters.category) {
//             updated = updated.filter(product =>
//                 product.category === filters.category
//             );
//         }

//         setFiltered(updated);
//     }, [searchText, filters, products]);

//     return (
//         <div className="home-container">
//             <ProductSidebar
//                 products={products}
//                 onSearch={setSearchText}
//                 onFilter={setFilters}
//             />
//             <div className="marketplace-content">
//                 <h2 className="marketplace-heading">Browse Available Produce</h2>
//                 <div className="product-grid">
//                     {filtered.length === 0 ? (
//                         <p>No Produce Found.</p>
//                     ) : (
//                         filtered.map(product => (
//                             <ProductCard key={product.id}
//                                 product={product} />
//                         ))
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Marketplace;

import React, { useState, useEffect } from "react";
import ProductCard from "../components/productCard";
import ProductSidebar from "../components/productSideBar";
import '../styles/components.css';

function Marketplace() {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [filters, setFilters] = useState({
        price: "",
        location: "",
        category: ""
    });
    const [cart, setCart] = useState([]);   // ✅ Cart state

    // 🔑 Fetch products from Flask backend instead of Firebase
    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/products")
            .then((res) => res.json())
            .then((data) => {
                // Normalize backend field names → frontend expects `name`, `image`
                const normalized = data.map((item) => ({
                    id: item.id,
                    name: item.product_name,            // 🔑 rename
                    category: item.selected_category,   // 🔑 rename
                    price: item.price,
                    quantity: item.quantity,
                    unit: item.unit,
                    location: item.location,
                    description: item.description,
                    image: item.image_url,              // 🔑 rename
                    contact_info: item.contact_info
                }));

                setProducts(normalized);
                setFiltered(normalized);
            })
            .catch((err) => console.error("Error fetching products:", err));
    }, []);

    // Filtering logic (unchanged)
    useEffect(() => {
        let updated = [...products];

        if (searchText) {
            updated = updated.filter(product =>
                product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                (product.location && product.location.toLowerCase().includes(searchText.toLowerCase()))
            );
        }

        if (filters.price) {
            updated = updated.filter(product =>
                Number(product.price) <= Number(filters.price)
            );
        }

        if (filters.location) {
            updated = updated.filter(product =>
                product.location === filters.location
            );
        }

        if (filters.category) {
            updated = updated.filter(product =>
                product.category === filters.category
            );
        }

        setFiltered(updated);
    }, [searchText, filters, products]);

    // ✅ Cart logic
    const addToCart = (product) => {
        if (!cart.some((item) => item.id === product.id)) {
            setCart([...cart, product]);
        }
    };

    const removeFromCart = (product) => {
        setCart(cart.filter((item) => item.id !== product.id));
    };

    return (
        <div className="home-container">
            <ProductSidebar
                products={products}
                onSearch={setSearchText}
                onFilter={setFilters}
            />
            <div className="marketplace-content">
                <div className="marketplace-header">
                    <h2 className="marketplace-heading">Browse Available Produce</h2>

                    {/* ✅ Cart count icon */}
                    <div className="cart-icon">
                        🛒 <span className="cart-count">{cart.length}</span>
                    </div>
                </div>

                <div className="product-grid">
                    {filtered.length === 0 ? (
                        <p>No Produce Found.</p>
                    ) : (
                        filtered.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                inCart={cart.some((item) => item.id === product.id)}
                                onAddToCart={addToCart}
                                onRemoveFromCart={removeFromCart}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Marketplace;
