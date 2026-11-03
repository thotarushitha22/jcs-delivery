import { useState, useEffect } from "react";
import { 
  Navigation, MapPin, Phone, CheckCircle2, Package, User, 
  Navigation2, LogOut, IndianRupee, CreditCard, History, 
  Truck, Search, MessageCircle, AlertCircle, Star, Wallet, XCircle, Filter
} from "lucide-react";
import { fetchAllOrders, updateOrderStatus, loginUser, registerUser, submitFeedbackApi } from "./api";
import toast from "react-hot-toast";
import "./DeliveryApp.css";

export default function DeliveryApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Auth State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agentCity, setAgentCity] = useState(localStorage.getItem("agentCity") || "Hyderabad");
  
  // Dashboard State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ACTIVE"); 
  const [paymentFilter, setPaymentFilter] = useState("ALL"); 
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [failedOrder, setFailedOrder] = useState(null);
  const [failureReason, setFailureReason] = useState("");
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch real orders directly from the backend
      const loadedOrders = await fetchAllOrders();
      setOrders(loadedOrders); 
    } catch (err) {
      toast.error("Failed to load deliveries. Check backend connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) loadData();
  }, [isLoggedIn]);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await registerUser({ name, email, password, role: "delivery" });
        toast.success("Registration successful! Please log in.");
        setIsRegistering(false); 
      } else {
        await loginUser({ email, password }); 
        localStorage.setItem("agentCity", agentCity);
        setIsLoggedIn(true);
        toast.success(`Logged in for ${agentCity} deliveries!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const handleUpdateStatus = async (order, newStatus, extraData = {}) => {
    const orderId = order.id || order._id || order.orderId;
    
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus, ...extraData } : o)));
      toast.success("Status Updated!");
      setFailedOrder(null);
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      const orderId = feedbackOrder.id || feedbackOrder._id || feedbackOrder.orderId;
      await submitFeedbackApi(orderId, { rating, feedback: feedbackText });
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, deliveryRating: rating, deliveryFeedback: feedbackText } : o)));
      toast.success("Feedback submitted!");
      setFeedbackOrder(null);
    } catch (err) {
      toast.error("Failed to submit feedback.");
    }
  };

  const getCustomerName = (order) => order.shippingName || order.user_name || "Customer";
  const getPhone = (order) => order.shippingPhone || "";

  // --- LOGIN / REGISTER SCREEN ---
  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f1f5f9", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ background: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
          
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
            <div style={{ background: "#2563eb", color: "#fff", padding: "16px", borderRadius: "50%" }}>
              <Navigation size={32} />
            </div>
          </div>
          
          <h2 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>
            {isRegistering ? "Partner Registration" : "Agent Login"}
          </h2>
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
            {isRegistering ? "Create an account to start delivering." : "Sign in to start your delivery route."}
          </p>
          
          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isRegistering && (
              <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px" }} />
            )}
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px" }} />
            <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px" }} />
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Select Your Delivery City</label>
              <select 
                value={agentCity} 
                onChange={(e) => setAgentCity(e.target.value)}
                style={{ padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", background: "#f8fafc", fontWeight: "600", color: "#0f172a", cursor: "pointer" }}
              >
                <option value="Hyderabad">Hyderabad</option>
                <option value="Vijayawada">Vijayawada</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
                <option value="Guntur">Guntur</option>
              </select>
            </div>

            <button type="submit" style={{ background: "#2563eb", color: "#fff", padding: "14px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "16px", cursor: "pointer", marginTop: "8px" }}>
              {isRegistering ? "Register Account" : "Log In"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>
              {isRegistering ? "Already have an account? " : "New delivery partner? "}
            </span>
            <button onClick={() => setIsRegistering(!isRegistering)} style={{ background: "none", border: "none", color: "#2563eb", fontWeight: "600", fontSize: "14px", cursor: "pointer", padding: 0 }}>
              {isRegistering ? "Log in here" : "Register here"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // 🚨 LOCATION FILTERING LOGIC 🚨
  // =====================================================================
  const citySpecificOrders = orders.filter(o => {
    const fullAddressString = `
      ${o.shippingCity || ""} 
      ${o.shippingAddress || ""} 
      ${o.address || ""} 
      ${o.shippingPincode || ""}
    `.toLowerCase();

    const targetCity = agentCity.toLowerCase().trim();
    return fullAddressString.includes(targetCity);
  });

  const activeOrders = citySpecificOrders.filter(o => ["DISPATCHED", "SHIPPED", "OUT_FOR_DELIVERY", "PROCESSING", "PENDING"].includes(String(o.status).toUpperCase()));
  const completedOrders = citySpecificOrders.filter(o => ["DELIVERED", "CANCELLED", "FAILED"].includes(String(o.status).toUpperCase()));
  
  let displayedOrders = activeTab === "ACTIVE" ? activeOrders : completedOrders;

  displayedOrders = displayedOrders.filter(o => {
    const isCOD = String(o.paymentMethod || o.payment_method).toLowerCase() === "cod";
    if (paymentFilter === "COD" && !isCOD) return false;
    if (paymentFilter === "ONLINE" && isCOD) return false;
    
    const q = searchQuery.toLowerCase();
    if (q && !String(o.id || o._id || o.orderId).toLowerCase().includes(q)) return false;
    return true;
  });

  const totalCOD = activeOrders.filter(o => String(o.paymentMethod || o.payment_method).toLowerCase() === "cod").reduce((sum, o) => sum + Number(o.totalAmount || o.total_amount || 0), 0);

  // --- DASHBOARD SCREEN ---
  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      <header style={{ background: "#0f172a", padding: "16px 24px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "#3b82f6", color: "#fff", padding: "8px", borderRadius: "8px" }}>
              <Navigation size={24} />
            </div>
            <div>
              <span style={{ color: "#fff", fontWeight: "bold", fontSize: "20px", display: "block" }}>Delivery Agent</span>
              <span style={{ color: "#94a3b8", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={12} /> Route: {agentCity}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
        
        {/* STATS BAR */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "15px", fontWeight: "600" }}>
              <Truck size={20} /> Active Deliveries in {agentCity}
            </div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#0f172a" }}>{activeOrders.length}</div>
          </div>
          
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#047857", fontSize: "15px", fontWeight: "600" }}>
              <Wallet size={20} /> COD Cash to Collect
            </div>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#b45309" }}>₹{totalCOD.toLocaleString()}</div>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <button onClick={() => setActiveTab("ACTIVE")} style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "none", fontWeight: "600", fontSize: "16px", cursor: "pointer", background: activeTab === "ACTIVE" ? "#2563eb" : "#fff", color: activeTab === "ACTIVE" ? "#fff" : "#475569", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              Active Deliveries ({activeOrders.length})
            </button>
            <button onClick={() => setActiveTab("COMPLETED")} style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "none", fontWeight: "600", fontSize: "16px", cursor: "pointer", background: activeTab === "COMPLETED" ? "#10b981" : "#fff", color: activeTab === "COMPLETED" ? "#fff" : "#475569", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              Completed History ({completedOrders.length})
            </button>
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", background: "#e2e8f0", padding: "4px", borderRadius: "10px" }}>
              {["ALL", "COD", "ONLINE"].map(filter => (
                <button key={filter} onClick={() => setPaymentFilter(filter)} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer", background: paymentFilter === filter ? "#fff" : "transparent", color: paymentFilter === filter ? "#0f172a" : "#64748b", boxShadow: paymentFilter === filter ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
                  {filter === "ALL" ? "All Orders" : filter === "COD" ? "COD (Cash)" : "Online (Paid)"}
                </button>
              ))}
            </div>

            <div style={{ position: "relative", flex: 1, minWidth: "250px" }}>
              <Search size={20} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input type="text" placeholder="Search by Order ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: "100%", padding: "14px 16px 14px 48px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "15px", background: "#fff", outline: "none" }} />
            </div>
          </div>
        </div>

        {/* ORDERS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px" }}>
          {loading ? (
            <p style={{ textAlign: "center", color: "#64748b", marginTop: "20px", gridColumn: "1 / -1", fontSize: "18px" }}>Loading deliveries...</p>
          ) : displayedOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: "16px", border: "1px dashed #cbd5e1", gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ color: "#1e293b", margin: "0 0 8px 0", fontSize: "20px" }}>No orders found</h3>
              <p style={{ color: "#64748b", fontSize: "16px" }}>There are no {activeTab.toLowerCase()} deliveries for {agentCity} matching your filters.</p>
            </div>
          ) : (
            displayedOrders.map((order) => {
              const orderId = order.id || order._id || order.orderId;
              const status = String(order.status || "").toUpperCase();
              const isOutForDelivery = status === "OUT_FOR_DELIVERY";
              const isDelivered = status === "DELIVERED";
              const isFailed = status === "FAILED" || status === "CANCELLED";
              const isCOD = String(order.paymentMethod || order.payment_method).toLowerCase() === "cod";
              
              const cityPart = order.shippingCity || "";
              const areaPart = [order.shippingAddress, order.shippingPincode].filter(Boolean).join(", ");
              const fullAddress = `${areaPart}, ${cityPart}`;
              const encodedAddress = encodeURIComponent(fullAddress);
              const phone = getPhone(order);

              let topBorderColor = "#2563eb";
              if (isCOD) topBorderColor = "#f59e0b";
              if (isDelivered) topBorderColor = "#10b981";
              if (isFailed) topBorderColor = "#ef4444";

              return (
                <div key={orderId} style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", borderTop: `4px solid ${topBorderColor}`, display: "flex", flexDirection: "column" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "20px", fontWeight: "bold", color: "#0f172a" }}>JCS-{String(orderId).slice(-6)}</h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "16px", marginTop: "4px" }}><User size={16} /> {getCustomerName(order)}</div>
                    </div>
                    <span style={{ background: isDelivered ? "#dcfce7" : isFailed ? "#fee2e2" : isCOD ? "#fef3c7" : "#eff6ff", color: isDelivered ? "#166534" : isFailed ? "#991b1b" : isCOD ? "#92400e" : "#1d4ed8", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                      {isDelivered ? "DELIVERED" : isFailed ? "FAILED" : isCOD ? <><IndianRupee size={12}/> COD</> : <><CreditCard size={12}/> PAID</>}
                    </span>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <MapPin size={20} color="#64748b" style={{ marginTop: "2px", flexShrink: 0 }} />
                      <div><div style={{ fontSize: "17px", fontWeight: "600", color: "#334155" }}>{cityPart || "City missing"}</div><div style={{ fontSize: "15px", color: "#64748b", marginTop: "4px", lineHeight: 1.5 }}>{areaPart || "Address missing"}</div></div>
                    </div>
                  </div>

                  {isCOD && !isDelivered && !isFailed && (
                    <div style={{ background: "#fffbeb", padding: "12px", borderRadius: "10px", marginBottom: "20px", border: "1px solid #fde68a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#92400e" }}>Cash to collect:</span>
                      <span style={{ fontSize: "18px", fontWeight: "bold", color: "#b45309" }}>₹{order.totalAmount || order.total_amount}</span>
                    </div>
                  )}

                  {phone && (
                    <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                      <a href={`tel:${phone}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#eff6ff", color: "#1d4ed8", textDecoration: "none", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "600" }}><Phone size={18} /> Call</a>
                      <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#f0fdf4", color: "#15803d", textDecoration: "none", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "600" }}><MessageCircle size={18} /> WhatsApp</a>
                    </div>
                  )}

                  {!isDelivered && !isFailed && (
                    <div style={{ marginBottom: "24px", flexGrow: 1 }}>
                      <iframe width="100%" height="220" style={{ border: "1px solid #e2e8f0", borderRadius: "12px" }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "12px", marginTop: "auto" }}>
                    {isFailed ? (
                       <button disabled style={{ flex: 1, background: "#f1f5f9", color: "#94a3b8", border: "none", padding: "16px", borderRadius: "12px", fontWeight: "600", fontSize: "16px" }}>Attempt Failed</button>
                    ) : isDelivered ? (
                       <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                         <button disabled style={{ flex: 1, background: "#f1f5f9", color: "#94a3b8", border: "none", padding: "16px", borderRadius: "12px", fontWeight: "600", fontSize: "16px" }}>Completed</button>
                         {!order.deliveryRating && (<button onClick={() => setFeedbackOrder(order)} style={{ flex: 1, background: "#fef3c7", color: "#92400e", border: "none", padding: "16px", borderRadius: "12px", fontWeight: "600", fontSize: "16px", cursor: "pointer" }}>Add Rating</button>)}
                       </div>
                    ) : !isOutForDelivery ? (
                      <button onClick={() => handleUpdateStatus(order, "OUT_FOR_DELIVERY")} style={{ flex: 1, background: "#2563eb", color: "#fff", border: "none", padding: "18px", borderRadius: "12px", fontWeight: "600", fontSize: "17px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Navigation2 size={20} /> Start Delivery</button>
                    ) : (
                      <>
                        <button onClick={() => setFailedOrder(order)} style={{ width: "60px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><AlertCircle size={24} /></button>
                        <button onClick={() => handleUpdateStatus(order, "DELIVERED")} style={{ flex: 1, background: isCOD ? "#f59e0b" : "#10b981", color: "#fff", border: "none", padding: "18px", borderRadius: "12px", fontWeight: "600", fontSize: "17px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><CheckCircle2 size={20} /> {isCOD ? `Collect ₹${order.totalAmount || order.total_amount}` : "Delivered"}</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* MODALS */}
      {failedOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "480px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "22px", color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}><AlertCircle size={28} color="#dc2626" /> Report Issue</h3>
            <p style={{ fontSize: "15px", color: "#64748b", marginBottom: "24px" }}>Why couldn't you deliver this package?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {["Customer not responding", "Wrong address / Not found", "Customer refused to accept", "Cash not available with customer"].map(reason => (
                <label key={reason} style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "16px", cursor: "pointer", padding: "16px", border: failureReason === reason ? "2px solid #dc2626" : "1px solid #e2e8f0", background: failureReason === reason ? "#fef2f2" : "#fff", borderRadius: "12px" }}>
                  <input type="radio" name="failReason" value={reason} checked={failureReason === reason} onChange={(e) => setFailureReason(e.target.value)} style={{ width: "20px", height: "20px", accentColor: "#dc2626" }} />
                  {reason}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <button onClick={() => setFailedOrder(null)} style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1", background: "#fff", color: "#475569", cursor: "pointer", fontWeight: "600", fontSize: "16px" }}>Cancel</button>
              <button disabled={!failureReason} onClick={() => handleUpdateStatus(failedOrder, "FAILED", { cancelReason: failureReason })} style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "none", background: "#dc2626", color: "#fff", cursor: failureReason ? "pointer" : "not-allowed", fontWeight: "600", fontSize: "16px", opacity: failureReason ? 1 : 0.5 }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {feedbackOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <form onSubmit={handleSubmitFeedback} style={{ background: "#fff", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "480px" }}>
            <h3 style={{ margin: "0 0 24px 0", fontSize: "22px", color: "#0f172a", textAlign: "center" }}>Rate your delivery</h3>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "32px" }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button type="button" key={star} onClick={() => setRating(star)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, transform: star <= rating ? "scale(1.15)" : "scale(1)", transition: "transform 0.1s" }}>
                  <Star size={48} fill={star <= rating ? "#f59e0b" : "none"} color={star <= rating ? "#f59e0b" : "#cbd5e1"} />
                </button>
              ))}
            </div>
            <textarea placeholder="Any comments? (Optional)" value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#0f172a", minHeight: "120px", marginBottom: "32px", fontFamily: "inherit", fontSize: "16px", resize: "none" }} />
            <div style={{ display: "flex", gap: "16px" }}>
              <button type="button" onClick={() => setFeedbackOrder(null)} style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1", background: "#fff", color: "#475569", cursor: "pointer", fontWeight: "600", fontSize: "16px" }}>Cancel</button>
              <button type="submit" style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "none", background: "#10b981", color: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "16px" }}>Submit</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}