# Education Management System Frontend

This is a frontend project for an education management system, built with Vue 3 + TypeScript. It's primarily used for managing courses and payment information for teachers and students.

## Tech Stack

-   **Core Framework**: Vue 3 + TypeScript
-   **Build Tool**: Vite
-   **UI Framework**: Element Plus
-   **State Management**: Pinia
-   **HTTP Client**: Axios
-   **Payment Integration**: Opn Payments (formerly Omise)
-   **Code Style**: ESLint + EditorConfig
-   **Style Preprocessor**: SASS

## Key Features

-   🔐 User Authentication (Teacher/Student)
-   📚 Course Management
    -   Teacher: Create and edit courses
    -   Student: View course list and details
-   💰 Payment Management
    -   Integrated with Opn Payments system
    -   Supports credit card payments
-   📊 Data Statistics
    -   Teacher: Number of courses, total number of invoices
    -   Student: Number of courses, number of pending invoices

## Project Structure

```
edu-management-frontend/
├── src/
│   ├── assets/ # Static assets
│   ├── components/ # Common components
│   ├── helpers/ # Utility functions
│   ├── http/ # API request related
│   ├── router/ # Router configuration
│   ├── stores/ # Pinia state management
│   └── views/ # Page components
```

## Development Guide

### Environment Requirements

-   Node.js >= 18
-   npm >= 9

### Local Development

1.  Clone the project and install dependencies:

```bash
git clone <repository-url>
cd edu-management-frontend
npm install
```

2.  Configure environment variables:

```bash
cp .env.example .env

Edit the .env file and set the necessary environment variables:
- VITE_API_BASE_URL: API endpoint URL
- VITE_OMISE_PUBLIC_KEY: Opn Payments public key
```

3.  Start the development server:

```bash
npm run dev
```

### Production Deployment

1.  Build the production version:

```bash
npm run build
```

2.  Deploy the files in the `dist` directory to your web server.

## Notes

### Development Notes

1.  **TypeScript**: Ensure all new code is written in TypeScript and includes appropriate type definitions.

2.  **API Integration**:
    -   All API endpoints are defined in the `src/http/endpoints/` directory.
    -   Use the `request` instance for API calls.

3.  **Payment Integration**:
    -   Use the `OpnPaymentButton` component to handle payments.
    -   Ensure the Opn Payments public key is correctly configured.

### Deployment Notes

1.  **Environment Variables**:
    -   Ensure all necessary environment variables are correctly configured in the production environment.
    -   Do not hardcode sensitive information in the code.

2.  **Cross-Origin Configuration**:
    -   Ensure the API server has the correct CORS policy configured.
    -   The frontend deployment domain needs to be whitelisted in the backend.

## Browser Support

-   Chrome >= 87
-   Firefox >= 78
-   Safari >= 14
-   Edge >= 88

## Contribution Guide

1.  Fork the project
2.  Create a feature branch: `git checkout -b feature/xxx`
3.  Commit your changes: `git commit -am 'feat: add xxx'`
4.  Push the branch: `git push origin feature/xxx`
5.  Submit a Pull Request

## License

MIT
