# 🎟️ SeatBook — Online Event Seat Booking System

A full-stack event seat booking web application where users can discover upcoming events, select seats, confirm bookings, and manage their tickets.

## 🌐 Live Demo

https://seat-booking-app-phi.vercel.app

## 💻 GitHub Repository

https://github.com/nishkha-ansi/seat-booking-app

## ✨ Features

- 🔐 User authentication with Supabase Auth
- 🎫 Create and manage events
- 📅 Upcoming events listing
- 💺 Automatic seat generation
- 🟢 Available / 🔴 booked / 🟣 selected seat states
- 🎟️ Book up to 4 seats per booking
- ⚡ Secure atomic seat booking using Supabase RPC
- 🚫 Concurrent booking conflict protection
- 💳 Booking bill with total price
- 📋 My Bookings page
- ❌ Cancel bookings before the event starts
- 📊 Organizer dashboard
- 💰 Revenue and sold-seat statistics
- 🔒 Row Level Security (RLS)
- 📱 Responsive user interface

## 🛠️ Tech Stack

- React
- TypeScript
- Vite
- Supabase
- PostgreSQL
- React Router
- Lucide React
- CSS
- Vercel

## 🗄️ Database

The application uses Supabase PostgreSQL with:

- `events`
- `seats`
- `bookings`

Database-level constraints and Row Level Security policies are used to protect important application rules.

Seat booking is handled through a PostgreSQL function to prevent two users from successfully booking the same seat at the same time.

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/nishkha-ansi/seat-booking-app.git
cd seat-booking-app