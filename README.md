# Workout Tracker

A mobile-first personal training tracker built for fast use during real gym sessions.

The project started from a simple product requirement: **record the workout without letting data entry interrupt the workout.**

Rather than presenting spreadsheet-like forms, the interface prioritizes the current training day, exercise order, last-used weights and quick adjustments.

## Product principles

- Mobile-first interface designed around iPhone-sized screens
- Minimal interaction during active workouts
- Exercise ordering and day-based training programs
- Previous weight visibility for progressive overload
- Fast weight adjustments
- Persistent workout and set history
- Clean separation between program configuration and workout execution

## Tech stack

- **Next.js 15**
- **React 19**
- **Supabase**
- **PostgreSQL**
- **Supabase SSR**
- **Vercel** deployment workflow

## Data model

The application separates program structure from performed workouts. Core entities include exercises, workout sessions and individual workout sets, allowing historical training data to remain independent from later program changes.

## Why it matters

This is a small project by scope, but deliberately product-driven: the UX is shaped by the environment in which the software is actually used — one-handed, on a phone, between sets, with as little friction as possible.

## Status

Actively developed as a personal software product and an exploration of mobile-first UX, lightweight data modeling and serverless application architecture.

---

**Software should fit the workflow — not force the workflow to fit the software.**