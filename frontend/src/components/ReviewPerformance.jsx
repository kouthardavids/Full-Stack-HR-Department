import React, { useState, useEffect } from "react";
import './Review.css';

const ReviewPerformance = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [newReview, setNewReview] = useState({
    name: "",
    role: "",
    department: "",
    performance_rating: "",
    attendance: "",
    review_date: "",
  });

  useEffect(() => {
    fetch("http://localhost:5004/api/")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error("Failed to fetch reviews:", err));
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 5) % reviews.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const visibleReviews = reviews.length > 0
    ? Array.from({ length: Math.min(5, reviews.length) }, (_, i) => reviews[(currentIndex + i) % reviews.length])
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddReview = async (e) => {
    e.preventDefault();

    for (const key in newReview) {
      const value = newReview[key];
      if (typeof value === 'string' && !value.trim()) {
        alert(`Please fill the ${key.replace('_', ' ')} field.`);
        return;
      }
    }

    try {
      const response = await fetch("http://localhost:5004/api/performanceReview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add review");
      }

      setReviews((prev) => [...prev, { id: data.id, ...newReview }]);

      setNewReview({
        name: "",
        role: "",
        department: "",
        performance_rating: "",
        attendance: "",
        review_date: "",
      });

      setModalOpen(false);

      // Show backend success message
      setSuccessMessage(data.message);

      // Clear after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="review-page">
      <h1 className="review-title">Performance Reviews</h1>

      {successMessage && (
        <div className="success-alert">
          {successMessage}
        </div>
      )}

      <button className="add-review-btn" onClick={() => setModalOpen(true)}>
        + Add Review
      </button>

      <div className="review-grid">
        {visibleReviews.map((review) => (
          <div key={review.id} className="review-card slide-in">
            <h2>{review.name}</h2>
            <p><strong>Role:</strong> {review.role}</p>
            <p><strong>Department:</strong> {review.department}</p>
            <p><strong>Performance Rating:</strong> {review.performance_rating}</p>
            <p><strong>Attendance:</strong> {review.attendance}</p>
            <p><strong>Review Date:</strong> {new Date(review.review_date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add a New Review</h2>
            <form className="modal-form" onSubmit={handleAddReview}>
              {[
                { label: "Name", name: "name", type: "text" },
                { label: "Role", name: "role", type: "text" },
                { label: "Department", name: "department", type: "text" },
                { label: "Performance Rating", name: "performance_rating", type: "text" },
                { label: "Attendance", name: "attendance", type: "text", placeholder: "e.g. 95%" },
                { label: "Review Date", name: "review_date", type: "date" },
              ].map(({ label, name, type, placeholder }) => (
                <label key={name} className="modal-label">
                  {label}:
                  <input
                    className="modal-input"
                    type={type}
                    name={name}
                    value={newReview[name]}
                    onChange={handleChange}
                    placeholder={placeholder || ""}
                    required
                  />
                </label>
              ))}

              <div className="modal-buttons">
                <button type="submit" className="modal-btn save-btn">
                  Add Review
                </button>
                <button
                  type="button"
                  className="modal-btn cancel-btn"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPerformance;
