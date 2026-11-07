
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API = "http://localhost:5000/api";

const emptyDonation = {
  title: "",
  foodType: "Cooked Meals",
  dietaryType: "Vegetarian",
  quantity: "",
  servingsEstimate: 10,
  preparedTime: "",
  expiryTime: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  contactPerson: "",
  contactPhone: "",
  instructions: "",
  notes: ""
};

const emptyRequest = {
  title: "",
  organizationName: "",
  peopleCount: 1,
  urgency: "Medium",
  foodTypeNeeded: "Cooked Meals",
  street: "",
  city: "",
  state: "",
  pincode: "",
  contactPhone: "",
  requiredByDate: "",
  notes: ""
};

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [donationForm, setDonationForm] = useState(emptyDonation);
  const [requestForm, setRequestForm] = useState(emptyRequest);

  const userId = user._id || user.id;
  const role = (user.role || "").toLowerCase();

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [donationResponse, requestResponse] = await Promise.all([
        fetch(`${API}/donations`),
        fetch(`${API}/requests`)
      ]);

      if (!donationResponse.ok || !requestResponse.ok) {
        throw new Error("Unable to load dashboard data.");
      }

      const donationData = await donationResponse.json();
      const requestData = await requestResponse.json();

      setDonations(Array.isArray(donationData) ? donationData : []);
      setRequests(Array.isArray(requestData) ? requestData : []);
    } catch (err) {
      setError(err.message || "Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("foodbridgeUser");
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {
      setUser({});
    }
    loadDashboard();
  }, []);

  const logout = () => {
    localStorage.removeItem("foodbridgeToken");
    localStorage.removeItem("foodbridgeUser");
    navigate("/login");
  };

  const updateDonationForm = (e) => {
    setDonationForm({
      ...donationForm,
      [e.target.name]: e.target.value
    });
  };

  const updateRequestForm = (e) => {
    setRequestForm({
      ...requestForm,
      [e.target.name]: e.target.value
    });
  };

  const showMessage = (message) => {
    setError("");
    setSuccess(message);
  };

  // DONOR: Create food donation
  const submitDonation = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userId) {
      setError("Account ID missing. Please log in again.");
      return;
    }

    if (new Date(donationForm.expiryTime) <= new Date()) {
      setError("Expiry time must be in the future.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API}/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donor: userId,
          title: donationForm.title,
          foodType: donationForm.foodType,
          dietaryType: donationForm.dietaryType,
          quantity: donationForm.quantity,
          servingsEstimate: Number(donationForm.servingsEstimate),
          preparedTime: donationForm.preparedTime
            ? new Date(donationForm.preparedTime).toISOString()
            : new Date().toISOString(),
          expiryTime: new Date(donationForm.expiryTime).toISOString(),
          pickupAddress: {
            street: donationForm.street,
            city: donationForm.city,
            state: donationForm.state,
            pincode: donationForm.pincode,
            contactPerson: donationForm.contactPerson,
            contactPhone: donationForm.contactPhone,
            instructions: donationForm.instructions
          },
          notes: donationForm.notes
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message);

      setDonationForm(emptyDonation);
      setShowDonationForm(false);
      showMessage("Food donation added successfully!");
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Unable to add donation.");
    } finally {
      setSaving(false);
    }
  };

  // RECEIVER: Create food request
  const submitRequest = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userId) {
      setError("Account ID missing. Please log in again.");
      return;
    }

    if (new Date(requestForm.requiredByDate) <= new Date()) {
      setError("Required-by date must be in the future.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requester: userId,
          title: requestForm.title,
          organizationName: requestForm.organizationName,
          peopleCount: Number(requestForm.peopleCount),
          urgency: requestForm.urgency,
          foodTypeNeeded: requestForm.foodTypeNeeded,
          deliveryAddress: {
            street: requestForm.street,
            city: requestForm.city,
            state: requestForm.state,
            pincode: requestForm.pincode,
            contactPhone: requestForm.contactPhone
          },
          requiredByDate: new Date(requestForm.requiredByDate).toISOString(),
          notes: requestForm.notes
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message);

      setRequestForm(emptyRequest);
      setShowRequestForm(false);
      showMessage("Food request created successfully!");
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Unable to create food request.");
    } finally {
      setSaving(false);
    }
  };

  // RECEIVER: Claim an available donation
  const claimDonation = async (donationId) => {
    if (!userId) {
      setError("Please log in again.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API}/donations/${donationId}/claim`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requesterId: userId })
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not claim donation.");

      showMessage("Donation claimed! It is now waiting for a volunteer.");
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  // VOLUNTEER: Accept a delivery task
  const acceptDelivery = async (donationId) => {
    if (!userId) {
      setError("Please log in again.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API}/donations/${donationId}/assign-volunteer`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ volunteerId: userId })
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not accept task.");

      showMessage("Delivery task accepted!");
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  // VOLUNTEER: Complete a delivery
  const completeDelivery = async (donationId) => {
    try {
      const response = await fetch(
        `${API}/donations/${donationId}/complete`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ volunteerId: userId })
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not complete delivery.");

      showMessage("Delivery completed successfully!");
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : "Not specified";

  const myRequests = requests.filter((item) => {
    const requesterId = item.requester?._id || item.requester;
    return String(requesterId) === String(userId);
  });

  const availableDonations = donations.filter(
    (item) => item.status === "Available"
  );

  const deliveryTasks = donations.filter(
    (item) =>
      item.status === "Claimed" ||
      (item.status === "In Transit" &&
        String(item.volunteer?._id || item.volunteer) === String(userId)) ||
      (item.status === "Completed" &&
        String(item.volunteer?._id || item.volunteer) === String(userId))
  );

  const myDonations = donations.filter(
    (item) =>
      String(item.donor?._id || item.donor) === String(userId)
  );

  const openRequests = requests.filter((item) => item.status === "Open").length;
  const completedDonations = donations.filter(
    (item) => item.status === "Completed"
  ).length;

  const pageTitle =
    role === "donor" ? "Donor Dashboard" :
    role === "ngo" ? "Receiver Dashboard" :
    role === "volunteer" ? "Volunteer Dashboard" :
    "FoodBridge Dashboard";

  const renderDonationForm = () => (
    <form className="donation-form" onSubmit={submitDonation}>
      <h3>Food Donation Details</h3>

      <label>Food Title *
        <input name="title" value={donationForm.title} onChange={updateDonationForm} required placeholder="Fresh lunch meals" />
      </label>

      <div className="donation-form-grid">
        <label>Food Type
          <select name="foodType" value={donationForm.foodType} onChange={updateDonationForm}>
            <option>Cooked Meals</option>
            <option>Raw Groceries</option>
            <option>Bakery & Dairy</option>
            <option>Fruits & Vegetables</option>
            <option>Packaged Food</option>
            <option>Other</option>
          </select>
        </label>

        <label>Dietary Type
          <select name="dietaryType" value={donationForm.dietaryType} onChange={updateDonationForm}>
            <option>Vegetarian</option>
            <option>Non-Vegetarian</option>
            <option>Vegan</option>
            <option>Eggitarian</option>
          </select>
        </label>

        <label>Quantity *
          <input name="quantity" value={donationForm.quantity} onChange={updateDonationForm} required placeholder="20 meals / 10 kg" />
        </label>

        <label>Estimated Servings
          <input type="number" min="1" name="servingsEstimate" value={donationForm.servingsEstimate} onChange={updateDonationForm} />
        </label>

        <label>Prepared Time
          <input type="datetime-local" name="preparedTime" value={donationForm.preparedTime} onChange={updateDonationForm} />
        </label>

        <label>Expiry Time *
          <input type="datetime-local" name="expiryTime" value={donationForm.expiryTime} onChange={updateDonationForm} required />
        </label>
      </div>

      <h3>Pickup Address</h3>
      <label>Street / Full Address *
        <input name="street" value={donationForm.street} onChange={updateDonationForm} required />
      </label>

      <div className="donation-form-grid">
        <label>City
          <input name="city" value={donationForm.city} onChange={updateDonationForm} />
        </label>
        <label>State
          <input name="state" value={donationForm.state} onChange={updateDonationForm} />
        </label>
        <label>Pincode
          <input name="pincode" value={donationForm.pincode} onChange={updateDonationForm} />
        </label>
        <label>Contact Person
          <input name="contactPerson" value={donationForm.contactPerson} onChange={updateDonationForm} />
        </label>
        <label>Contact Phone
          <input name="contactPhone" value={donationForm.contactPhone} onChange={updateDonationForm} />
        </label>
      </div>

      <label>Pickup Instructions
        <textarea name="instructions" value={donationForm.instructions} onChange={updateDonationForm} rows="2" />
      </label>
      <label>Additional Notes
        <textarea name="notes" value={donationForm.notes} onChange={updateDonationForm} rows="2" />
      </label>

      <button className="submit-donation-button" disabled={saving}>
        {saving ? "Saving..." : "Submit Donation"}
      </button>
    </form>
  );

  const renderRequestForm = () => (
    <form className="donation-form" onSubmit={submitRequest}>
      <h3>Food Request Details</h3>

      <label>Request Title *
        <input name="title" value={requestForm.title} onChange={updateRequestForm} required placeholder="Food for community lunch" />
      </label>

      <div className="donation-form-grid">
        <label>Organization / Community Name *
          <input name="organizationName" value={requestForm.organizationName} onChange={updateRequestForm} required />
        </label>

        <label>Number of People *
          <input type="number" min="1" name="peopleCount" value={requestForm.peopleCount} onChange={updateRequestForm} required />
        </label>

        <label>Urgency
          <select name="urgency" value={requestForm.urgency} onChange={updateRequestForm}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </label>

        <label>Food Needed
          <select name="foodTypeNeeded" value={requestForm.foodTypeNeeded} onChange={updateRequestForm}>
            <option>Cooked Meals</option>
            <option>Raw Groceries</option>
            <option>Packaged Food</option>
            <option>Baby Food & Milk</option>
            <option>Any</option>
          </select>
        </label>

        <label>Required By *
          <input type="datetime-local" name="requiredByDate" value={requestForm.requiredByDate} onChange={updateRequestForm} required />
        </label>

        <label>Contact Phone
          <input name="contactPhone" value={requestForm.contactPhone} onChange={updateRequestForm} />
        </label>
      </div>

      <h3>Delivery Address</h3>
      <label>Street / Full Address *
        <input name="street" value={requestForm.street} onChange={updateRequestForm} required />
      </label>

      <div className="donation-form-grid">
        <label>City
          <input name="city" value={requestForm.city} onChange={updateRequestForm} />
        </label>
        <label>State
          <input name="state" value={requestForm.state} onChange={updateRequestForm} />
        </label>
        <label>Pincode
          <input name="pincode" value={requestForm.pincode} onChange={updateRequestForm} />
        </label>
      </div>

      <label>Additional Notes
        <textarea name="notes" value={requestForm.notes} onChange={updateRequestForm} rows="3" />
      </label>

      <button className="submit-donation-button" disabled={saving}>
        {saving ? "Submitting..." : "Submit Food Request"}
      </button>
    </form>
  );

  const renderDonationCard = (item, action) => (
    <div className="dashboard-item" key={item._id}>
      <div className="dashboard-item-content">
        <h3>{item.title}</h3>
        <p>Food type: {item.foodType}</p>
        <p>Quantity: {item.quantity}</p>
        <p>Expiry: {formatDate(item.expiryTime)}</p>
        <p>Donor: {item.donor?.name || "FoodBridge donor"}</p>
        <p>Pickup: {item.pickupAddress?.street || "Not specified"}</p>
        {item.pickupAddress?.city && <p>City: {item.pickupAddress.city}</p>}
        {item.claimedBy?.name && <p>Claimed by: {item.claimedBy.name}</p>}
        {item.volunteer?.name && <p>Volunteer: {item.volunteer.name}</p>}
      </div>

      <div className="dashboard-item-actions">
        <span className="status-label">{item.status}</span>
        {action && action(item)}
      </div>
    </div>
  );

  if (!userId) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-container">
          <h2>Loading your account...</h2>
          <p>If this message remains, please log in again.</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <div className="dashboard-logo">🍃 FoodBridge</div>
        <div className="dashboard-user">
          <span>{user.name || "User"} · {role.toUpperCase()}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-container">
        <section className="dashboard-heading">
          <div>
            <h1>{pageTitle}</h1>
            <p>Share food. Reduce waste. Help your community.</p>
          </div>
          <button className="refresh-button" onClick={loadDashboard}>Refresh Data</button>
        </section>

        <section className="dashboard-welcome">
          <h2>Hello, {user.name || "FoodBridge Member"}! 👋</h2>
          <p>Welcome to your FoodBridge community dashboard.</p>
          <p>Account role: {role}</p>
        </section>

        {error && <div className="dashboard-error">{error}</div>}
        {success && <div className="dashboard-success">{success}</div>}

        {role === "donor" && (
          <>
            <section className="donation-create-section">
              <div className="donation-create-heading">
                <div>
                  <h2>Share Food with Someone ❤️</h2>
                  <p>Add available food for people in need.</p>
                </div>
                <button className="add-donation-button" onClick={() => setShowDonationForm(!showDonationForm)}>
                  {showDonationForm ? "Close Form" : "+ Add Donation"}
                </button>
              </div>
              {showDonationForm && renderDonationForm()}
            </section>

            <section className="stats-grid">
              <div className="stat-card"><span>🍱</span><h3>My Donations</h3><strong>{myDonations.length}</strong></div>
              <div className="stat-card"><span>🥗</span><h3>Available Food</h3><strong>{myDonations.filter(d => d.status === "Available").length}</strong></div>
              <div className="stat-card"><span>✅</span><h3>Completed</h3><strong>{myDonations.filter(d => d.status === "Completed").length}</strong></div>
              <div className="stat-card"><span>🤝</span><h3>Open Requests</h3><strong>{openRequests}</strong></div>
            </section>

            <section className="dashboard-section">
              <h2>My Food Donations</h2>
              {loading ? <p>Loading...</p> :
                myDonations.length === 0 ? <p>You haven't added any donations yet.</p> :
                <div className="dashboard-list">
                  {myDonations.map(item => renderDonationCard(item))}
                </div>}
            </section>
          </>
        )}

        {role === "ngo" && (
          <>
            <section className="donation-create-section">
              <div className="donation-create-heading">
                <div>
                  <h2>Request Food for Your Community</h2>
                  <p>Tell donors what food your organization needs.</p>
                </div>
                <button className="add-donation-button" onClick={() => setShowRequestForm(!showRequestForm)}>
                  {showRequestForm ? "Close Form" : "+ Create Food Request"}
                </button>
              </div>
              {showRequestForm && renderRequestForm()}
            </section>

            <section className="stats-grid">
              <div className="stat-card"><span>📝</span><h3>My Requests</h3><strong>{myRequests.length}</strong></div>
              <div className="stat-card"><span>⏳</span><h3>Open Requests</h3><strong>{myRequests.filter(r => r.status === "Open").length}</strong></div>
              <div className="stat-card"><span>🥗</span><h3>Available Donations</h3><strong>{availableDonations.length}</strong></div>
              <div className="stat-card"><span>✅</span><h3>Fulfilled Requests</h3><strong>{myRequests.filter(r => r.status === "Fulfilled").length}</strong></div>
            </section>

            <section className="dashboard-section">
              <h2>Available Food Donations</h2>
              {loading ? <p>Loading...</p> :
                availableDonations.length === 0 ? <p>No available donations right now.</p> :
                <div className="dashboard-list">
                  {availableDonations.map(item =>
                    renderDonationCard(item, () => (
                      <button className="small-action-button" onClick={() => claimDonation(item._id)}>
                        Claim Food
                      </button>
                    ))
                  )}
                </div>}
            </section>

            <section className="dashboard-section">
              <h2>My Food Requests</h2>
              {loading ? <p>Loading...</p> :
                myRequests.length === 0 ? <p>You haven't created any food requests yet.</p> :
                <div className="dashboard-list">
                  {myRequests.map(item => (
                    <div className="dashboard-item" key={item._id}>
                      <div>
                        <h3>{item.title}</h3>
                        <p>Organization: {item.organizationName}</p>
                        <p>People: {item.peopleCount}</p>
                        <p>Food needed: {item.foodTypeNeeded}</p>
                        <p>Urgency: {item.urgency}</p>
                        <p>Required by: {formatDate(item.requiredByDate)}</p>
                      </div>
                      <span className="status-label">{item.status}</span>
                    </div>
                  ))}
                </div>}
            </section>
          </>
        )}

        {role === "volunteer" && (
          <>
            <section className="stats-grid">
              <div className="stat-card"><span>📦</span><h3>Tasks Available</h3><strong>{donations.filter(d => d.status === "Claimed" && !d.volunteer).length}</strong></div>
              <div className="stat-card"><span>🚚</span><h3>My Active Deliveries</h3><strong>{deliveryTasks.filter(d => d.status === "In Transit").length}</strong></div>
              <div className="stat-card"><span>✅</span><h3>My Completed</h3><strong>{deliveryTasks.filter(d => d.status === "Completed").length}</strong></div>
              <div className="stat-card"><span>🤝</span><h3>Community Requests</h3><strong>{openRequests}</strong></div>
            </section>

            <section className="dashboard-section">
              <h2>Available Delivery Tasks</h2>
              <p>These donations have been claimed by receivers and need delivery volunteers.</p>
              {loading ? <p>Loading...</p> :
                donations.filter(d => d.status === "Claimed" && !d.volunteer).length === 0 ?
                  <p>No delivery tasks are waiting right now.</p> :
                  <div className="dashboard-list">
                    {donations.filter(d => d.status === "Claimed" && !d.volunteer).map(item =>
                      renderDonationCard(item, () => (
                        <button className="small-action-button" onClick={() => acceptDelivery(item._id)}>
                          Accept Delivery
                        </button>
                      ))
                    )}
                  </div>}
            </section>

            <section className="dashboard-section">
              <h2>My Delivery Tasks</h2>
              {loading ? <p>Loading...</p> :
                deliveryTasks.length === 0 ? <p>You haven't accepted any delivery tasks yet.</p> :
                <div className="dashboard-list">
                  {deliveryTasks.map(item =>
                    renderDonationCard(item, () =>
                      item.status === "In Transit" ? (
                        <button className="small-action-button" onClick={() => completeDelivery(item._id)}>
                          Mark Delivered
                        </button>
                      ) : null
                    )
                  )}
                </div>}
            </section>
          </>
        )}

        {!["donor", "ngo", "volunteer"].includes(role) && (
          <section className="dashboard-section">
            <h2>Account role not recognized</h2>
            <p>Please log in with a Donor, NGO, or Volunteer account.</p>
          </section>
        )}
      </main>

      <footer className="dashboard-footer">
        <p>© 2026 FoodBridge. Share Food. Spread Happiness.</p>
      </footer>
    </div>
  );
}

export default Dashboard;
