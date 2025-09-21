import type { PesticideRating } from '../types';

const PESTICIDE_RATINGS_KEY = 'agriGuardPesticideRatings';

type AllRatings = Record<string, PesticideRating>;

export const getPesticideRatings = (): AllRatings => {
  try {
    const ratingsJson = localStorage.getItem(PESTICIDE_RATINGS_KEY);
    return ratingsJson ? JSON.parse(ratingsJson) : {};
  } catch (e) {
    console.error("Failed to parse pesticide ratings from localStorage", e);
    return {};
  }
};

export const savePesticideRatings = (ratings: AllRatings) => {
  try {
    localStorage.setItem(PESTICIDE_RATINGS_KEY, JSON.stringify(ratings));
  } catch (e) {
    console.error("Failed to save pesticide ratings to localStorage", e);
  }
};
