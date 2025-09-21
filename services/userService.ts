import type { User } from '../types';

const USERS_KEY = 'agriGuardUsers';
const CURRENT_USER_KEY = 'agriGuardCurrentUser';

type AllUsers = Record<string, User>;

export type UserData = User['data'];

// Function to get all users from local storage
export const getAllUsers = (): AllUsers => {
  try {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : {};
  } catch (e) {
    console.error("Failed to parse users from localStorage", e);
    return {};
  }
};

// Function to save a specific user's data
export const saveUser = (username: string, userData: User) => {
  try {
    const allUsers = getAllUsers();
    allUsers[username] = userData;
    localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
  } catch (e) {
    console.error("Failed to save user to localStorage", e);
  }
};

// Function to delete a user
export const deleteUser = (username: string) => {
    try {
        const allUsers = getAllUsers();
        delete allUsers[username];
        localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
    } catch (e) {
        console.error("Failed to delete user from localStorage", e);
    }
};

// Functions for session management
export const getCurrentUser = (): string | null => {
  return localStorage.getItem(CURRENT_USER_KEY);
};

export const setCurrentUser = (username: string) => {
  localStorage.setItem(CURRENT_USER_KEY, username);
};

export const clearCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};