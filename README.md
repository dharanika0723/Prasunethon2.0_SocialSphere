# SocialSphere

SocialSphere is an AI-powered social impact platform designed to connect volunteers, NGOs, colleges, companies, and government organizations to meaningful community initiatives.

## Overview

SocialSphere provides a centralized platform for discovering and managing social-impact campaigns, volunteer participation, community interaction, attendance, and certificates.

## Key Features

- Role-based user registration and authentication
- Volunteer, NGO, college, company, and government workflows
- Social-impact campaign and event management
- Campaign applications and participation
- Attendance tracking
- Certificate management
- Community posts and interaction
- User profiles and role-specific dashboards
- Supabase database integration
- Responsive and modern user interface

## Technology Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- PostgreSQL
- ESLint

## Project Structure

```text
SocialSphere/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
├── supabase/
│   └── migrations/
├── public/
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js 18 or later
- npm
- A Supabase project

You can verify Node.js and npm with:

```bash
node --version
npm --version
```

## Installation

Clone the repository:

```bash
git clone https://github.com/dharanika0723/Prasunethon2.0_SocialSphere.git
```

Move into the project directory:

```bash
cd Prasunethon2.0_SocialSphere
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root.

Use your own Supabase project credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit the `.env` file to GitHub.

The repository's `.gitignore` is configured to exclude environment files.

## Supabase Setup

1. Create a Supabase project.
2. Copy the project URL and anon key into your `.env` file.
3. Open the Supabase SQL Editor.
4. Run the SQL migration files from:

```text
supabase/migrations/
```

Run them in timestamp/order sequence.

## Run the Project

Start the development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal, normally:

```text
http://localhost:5173/
```

## Build for Production

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Security

- Never commit `.env` or other files containing private credentials.
- Never expose Supabase service-role keys in frontend code.
- Use Supabase Row Level Security (RLS) policies for database access control.
- Keep `node_modules` and build output out of the repository.

## GitHub

Repository:

https://github.com/dharanika0723/Prasunethon2.0_SocialSphere

## Project Purpose

SocialSphere aims to make volunteering and social-impact participation easier to discover, manage, verify, and measure through a single digital platform.

## Team

Developed for Prasunethon 2.0.
