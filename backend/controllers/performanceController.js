import { getAllReviews, addReview } from '../models/performanceReviewModel.js';

export const getReviews = async (req, res) => {
  try {
    const reviews = await getAllReviews();
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createReview = async (req, res) => {
  try {
    const newReview = req.body;
    const result = await addReview(newReview);
    res.status(201).json({ message: 'Review added successfully', id: result.id });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
};
