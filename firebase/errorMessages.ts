export const firebaseErrorMessages: Record<string, string> = {
  "auth/invalid-email": "Please enter a valid email address",
  "auth/missing-email": "Please enter an email address",
  "auth/missing-password": "Please enter a password",
  "auth/weak-password": "Password must be at least 6 characters",
  "auth/network-request-failed": "Network error. Check your connection",
  "auth/too-many-requests": "Too many attempts. Please wait and try again",
  "auth/internal-error": "Unexpected error. Please try again",

  // Login
  "auth/invalid-credential": "Incorrect email or password",
  "auth/wrong-password": "Incorrect password",
  "auth/user-not-found": "No account found with that email",
  "auth/user-disabled": "This account has been disabled",

  // Register
  "auth/email-already-in-use": "This email is already registered",
  "auth/operation-not-allowed": "Email and password accounts are not enabled",
};
