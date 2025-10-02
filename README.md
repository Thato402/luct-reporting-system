# LUCT Reporting System

A comprehensive web application for managing lecture reports, ratings, and analytics at Limkokwing University of Creative Technology.

## Features

- **User Authentication** - Role-based access (Student, Lecturer, Principal Lecturer, Program Leader)
- **Report Management** - Submit, view, and manage lecture reports
- **Rating System** - Rate lecturers, courses, classes, and facilities
- **Analytics Dashboard** - Comprehensive statistics and reporting
- **Excel Export** - Export reports to Excel format
- **Real-time Data** - Live updates and filtering

## Tech Stack

### Backend
- Node.js & Express.js
- PostgreSQL Database
- JWT Authentication
- Excel.js for export functionality

### Frontend
- React.js
- Bootstrap 5
- React Router
- Font Awesome Icons

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with database credentials
npm start