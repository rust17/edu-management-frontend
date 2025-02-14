/*
  Here are the backend business codes
  The backend response is unified in this format, where 0 indicates success and non-zero indicates failure
  {
    "code": 0, // Business code
    "message": "Operation successful", // Prompt message
    "data": null // Data
  }
*/
export const SUCCESS = 0 // Operation successful
export const TOKEN_EXPIRED = 1 // Token expired or invalid, general error
export const LOGIN_FAILED = 2 // Login failed
