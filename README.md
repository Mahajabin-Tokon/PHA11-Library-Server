# Bookish Backend - Book Management API

## Description

The Bookish Backend is a robust RESTful API designed to manage books and borrowing operations for the Bookish platform. It supports features like user authentication, book management, category filtering, and borrowing/returning books. Built with Express and MongoDB, it ensures secure, scalable, and efficient data handling for seamless integration with the frontend.

## Packages Used

- **Express**: Framework for building the API endpoints and server functionality.
- **Cors**: Middleware for enabling Cross-Origin Resource Sharing to connect with the frontend.
- **MongoDB**: Database for managing books and user data.
- **Dotenv**: Loads environment variables from a `.env` file into the application.
- **Jsonwebtoken**: Used for secure user authentication via JWTs.
- **Cookie-parser**: Parses cookies for managing user sessions.

## Key Features

1. **Authentication**:
   - JWT-based authentication to secure API endpoints.
   - Generates secure tokens for user login and validates them for authorized requests.

2. **Book Management**:
   - **GET `/allBooks`**: Retrieves all books from the database.
   - **GET `/booksByCategory`**: Fetches books by specific categories (e.g., History, Romance).
   - **POST `/addBook`**: Adds a new book to the collection.
   - **PATCH `/book/:id`**: Updates book details like title, author, and category.

3. **Borrowing and Returning Books**:
   - **POST `/borrowBook`**: Allows users to borrow a book, reducing its available quantity.
   - **GET `/borrowedBooks/:email`**: Fetches all books borrowed by a specific user.
   - **POST `/return`**: Handles returning of books and updates their quantity in the database.

4. **Middleware and Security**:
   - Implements `verifyToken` middleware to ensure only authorized users can access certain routes.
   - Handles CORS policies for secure communication between the frontend and backend.

5. **Dynamic Filtering**:
   - Supports query-based filtering to fetch books by categories or other criteria.

6. **Deployment Ready**:
   - Configured for deployment on Vercel with a `vercel.json` file, supporting all HTTP methods and dynamic routes.

## Future Enhancements

1. **User Roles**:
   - Introduce roles (Admin/User) to restrict access to specific endpoints based on permissions.

2. **Analytics Dashboard**:
   - Provide metrics for popular books, borrowing trends, and user activity for admins.

3. **Enhanced Search**:
   - Implement advanced search capabilities to find books based on multiple criteria like ratings, availability, and author names.
