import db from '../config/db.js';

export const getAllReviews = async () => {
  const [rows] = await db.query('SELECT * FROM performance_reviews ORDER BY review_date DESC');
  return rows;
};

export const addReview = async (review) => {
  const {
    name,
    role,
    department,
    performance_rating,
    attendance,
    review_date,
  } = review;

  const [result] = await db.query(
    'INSERT INTO performance_reviews (name, role, department, performance_rating, attendance, review_date) VALUES (?, ?, ?, ?, ?, ?)',
    [name, role, department, performance_rating, attendance, review_date]
  );

  return { id: result.insertId };
};
