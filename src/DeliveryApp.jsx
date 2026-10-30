import { useState, useEffect } from "react";
import { Navigation, MapPin, Phone, CheckCircle2, Package, User, Navigation2, LogOut, IndianRupee, CreditCard, History, Truck } from "lucide-react";
import { fetchAllOrders, updateOrderStatus, loginUser } from "./api";
import toast from "react-hot-toast";
import "./DeliveryApp.css";

export default function DeliveryApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // NEW: State to switch between Active and Completed
  const [activeTab, setActiveTab] = useState("ACTIVE"); 

  const loadData = async () => {
    setLoading(true);
    try {
      const loadedOrders = await fetchAllOrders();
      
      // We now fetch ALL orders that are either active or delivered
      const relevantOrders = loadedOrders.filter(o => {
        const st = String(o.status || "").toUpperCase();
        return ["DISPATCHED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(st);
      });
      
      setOrders(relevantOrders);
    } catch (err) {
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      setIsLoggedIn(true);
      toast.success("Logged in successfully!");
    } catch (err) {
      toast.error("Invalid email or password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const handleUpdateStatus = async (order, newStatus) => {
    const orderId = order.id || order._id || order.orderId;
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update local state without removing from the list immediately
      setOrders(prev => prev.map(o => 
        (o.id || o._id || o.orderId) === orderId ? { ...o, status: newStatus } : o
      ));

      if (newStatus === "DELIVERED") {
        toast.success("Order Delivered Successfully!");
      } else {
        toast.success("Status Updated!");
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const getCustomerName = (order) => order.shippingName || order.user_name || order.customerName || "Customer";
  const getPhone = (order) => order.shippingPhone || "Phone not provided";

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="delivery-layout full-width">
        <header className="delivery-header">
          <div className="delivery-brand">
            <div className="delivery-logo"><Navigation size={20} /></div>
            <span>Delivery Agent</span>
          </div>
        </header>
        <main className="delivery-main center-content">
          <form onSubmit={handleLogin} className="login-form">
            <h2>Agent Login</h2>
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="btn-deliver green">Log In</button>
          </form>
        </main>
      </div>
    );
  }

  // Filter orders based on the selected tab
  const activeOrders = orders.filter(o => ["DISPATCHED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(String(o.status).toUpperCase()));
  const completedOrders = orders.filter(o => String(o.status).toUpperCase() === "DELIVERED");

  const displayedOrders = activeTab === "ACTIVE" ? activeOrders : completedOrders;

  // --- DASHBOARD SCREEN ---
  return (
    <div className="delivery-layout full-width">
      <header className="delivery-header" style={{ justifyContent: "space-between" }}>
        <div className="delivery-brand">
          <div className="delivery-logo"><Navigation size={20} /></div>
          <span>Delivery Agent</span>
        </div>
        <button onClick={handleLogout} className="logout-btn"><LogOut size={20} /></button>
      </header>

      <main className="delivery-main">
        
        {/* STATS BAR */}
        <div className="delivery-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div 
            className="delivery-stat-box" 
            style={{ cursor: "pointer", border: activeTab === "ACTIVE" ? "2px solid #2563eb" : "1px solid #e2e8f0", background: activeTab === "ACTIVE" ? "#eff6ff" : "#fff" }}
            onClick={() => setActiveTab("ACTIVE")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: activeTab === "ACTIVE" ? "#1d4ed8" : "#64748b" }}>
              <Truck size={18} />
              <span className="stat-label">Active Deliveries</span>
            </div>
            <h2 className="stat-value" style={{ color: activeTab === "ACTIVE" ? "#1e3a8a" : "#0f172a" }}>{activeOrders.length}</h2>
          </div>

          <div 
            className="delivery-stat-box" 
            style={{ cursor: "pointer", border: activeTab === "COMPLETED" ? "2px solid #10b981" : "1px solid #e2e8f0", background: activeTab === "COMPLETED" ? "#ecfdf5" : "#fff" }}
            onClick={() => setActiveTab("COMPLETED")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: activeTab === "COMPLETED" ? "#047857" : "#64748b" }}>
              <History size={18} />
              <span className="stat-label">Completed Orders</span>
            </div>
            <h2 className="stat-value" style={{ color: activeTab === "COMPLETED" ? "#064e3b" : "#0f172a" }}>{completedOrders.length}</h2>
          </div>
        </div>

        <h3 className="section-title">
          {activeTab === "ACTIVE" ? "Today's Active Route" : "Completed Deliveries History"}
        </h3>

        {loading ? (
          <p className="empty-state">Loading data...</p>
        ) : displayedOrders.length === 0 ? (
          <p className="empty-state">
            {activeTab === "ACTIVE" ? "No active deliveries right now." : "No completed deliveries yet."}
          </p>
        ) : (
          <div className="delivery-grid">
            {displayedOrders.map((order) => {
              const orderId = order.id || order._id || order.orderId;
              const status = String(order.status || "").toUpperCase();
              const isOutForDelivery = status === "OUT_FOR_DELIVERY";
              const isDelivered = status === "DELIVERED";
              const isCOD = String(order.paymentMethod).toLowerCase() === "cod";
              
              const cityPart = order.shippingCity || "";
              const areaPart = [order.shippingAddress, order.shippingPincode].filter(Boolean).join(", ");
              
              const fullAddress = `${areaPart}, ${cityPart}`;
              const encodedAddress = encodeURIComponent(fullAddress);

              return (
                <div key={orderId} className="delivery-card" style={{ opacity: isDelivered ? 0.85 : 1 }}>
                  
                  <div className="delivery-card-header">
                    <div>
                      <h4>JCS-{String(orderId).slice(-6)}</h4>
                      <p className="customer-name"><User size={14} /> {getCustomerName(order)}</p>
                    </div>
                    <span className={`delivery-badge ${isCOD ? 'cod' : 'paid'}`} style={isDelivered ? { background: "#dcfce7", color: "#166534" } : {}}>
                      {isDelivered ? "DELIVERED" : isCOD ? <><IndianRupee size={12} /> COD</> : <><CreditCard size={12} /> PAID ONLINE</>}
                    </span>
                  </div>

                  <div className="delivery-card-body">
                    <div className="delivery-location-section">
                      <h5 className="info-label">Delivery Location</h5>
                      <div className="location-block">
                        <h3 className="city-text">{cityPart || "City not specified"}</h3>
                        <p className="area-text">{areaPart || "Address missing"}</p>
                      </div>
                      <div className="info-row" style={{ marginTop: "12px" }}>
                        <Phone size={16} className="info-icon" />
                        <p>{getPhone(order)}</p>
                      </div>
                    </div>

                    <div className="delivery-products-section">
                      <h5 className="info-label"><Package size={14} /> Items in Package</h5>
                      <div className="delivery-items">
                        {order.items && order.items.length > 0 ? order.items.map((item, i) => (
                          <div key={i} className="item-row">
                            <span>{item.title || item.name || "Product"}</span>
                            <strong>Qty: {item.qty || item.quantity || 1}</strong>
                          </div>
                        )) : <p style={{ fontSize: "13px", color: "#64748b" }}>Items not listed.</p>}
                      </div>
                    </div>
                  </div>

                  {/* GOOGLE MAPS EMBED - Only show if not delivered to save load time */}
                  {!isDelivered && (
                    <div className="live-map-section">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <h5 className="info-label" style={{ margin: 0 }}><MapPin size={14} /> Customer Map Location</h5>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ fontSize: "12px", color: "#2563eb", fontWeight: "bold", textDecoration: "none" }}
                        >
                          Open in Google Maps →
                        </a>
                      </div>
                      
                      <iframe 
                        width="100%" 
                        height="250" 
                        style={{ border: "1px solid #e2e8f0", borderRadius: "8px" }}
                        loading="lazy" 
                        allowFullScreen 
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      ></iframe>
                    </div>
                  )}

                  <div className="delivery-actions">
                    {isDelivered ? (
                       <button disabled style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #cbd5e1", padding: "12px", borderRadius: "8px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%" }}>
                         <CheckCircle2 size={18} /> Order Completed
                       </button>
                    ) : !isOutForDelivery ? (
                      <button className="btn-deliver blue" onClick={() => handleUpdateStatus(order, "OUT_FOR_DELIVERY")}>
                        <Navigation2 size={18} /> Start Delivery
                      </button>
                    ) : (
                      <button 
                        className={`btn-deliver ${isCOD ? 'orange' : 'green'}`} 
                        onClick={() => handleUpdateStatus(order, "DELIVERED")}
                      >
                        <CheckCircle2 size={18} /> 
                        {isCOD ? `Collect ₹${order.totalAmount} & Deliver` : "Mark as Delivered"}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}