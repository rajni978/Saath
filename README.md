# Saath ❤️
### Care, together. Quiet until it matters.

Saath is a shared healthcare management platform designed to help elderly people manage their medicines, appointments, and daily healthcare routines while keeping their trusted family members and caregivers connected.

The goal is simple: give elderly people more independence while helping their families stay informed when support is needed.

## The Problem

Elderly people who live alone may forget medication schedules or appointments. Family members and caregivers may also struggle to coordinate care, leading to missed doses, confusion, or duplicate medication records.

Most reminder apps focus only on reminding someone to take medicine. Saath focuses on shared care and coordination.

## Our Solution

Saath provides one shared healthcare profile where an elderly person and their authorized helpers can coordinate medication routines and appointments.

It stays quiet when everything is going well and escalates important missed routines when attention is needed.

## Key Features

- **Passcode-based access:** Separate access for elderly users and helpers.
- **Medication management:** Add and manage medicines, dosage, schedules, and priority.
- **Daily medication tracking:** Mark doses as Taken or Skipped.
- **Dose Lock:** Prevents multiple caregivers from recording the same dose.
- **Progressive alerts:** Escalates missed critical medication reminders to the appropriate people.
- **Elder-controlled notifications:** Lets the elderly user choose how much information helpers receive.
- **Appointment coordination:** Add appointments and allow a helper to claim responsibility for accompanying the elder.
- **Shared activity log:** View important care-related actions.
- **Demo mode:** Explore the application using sample data and simulated notifications.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Nodemailer

## Demo Scenario

The prototype uses a sample profile for Mrs. Sharma, a 72-year-old woman living alone.

Her daughter Riya and son Arjun can access her shared care information as helpers. If an important medication is missed, Saath progressively alerts the appropriate family members.

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB, if using the database-backed version

### Installation

Clone the repository:

```bash
git clone https://github.com/rajni978/Saath.git
cd Saath
```

Install frontend dependencies:

```bash
cd client
npm install
npm run dev
```

Install and run the backend in a separate terminal:

```bash
cd server
npm install
npm run dev
```

Configure the required environment variables in your local `.env` files before running the database-backed version. Never commit real credentials or API keys.

## Important Note

Saath is a hackathon prototype, not a medical device or emergency response system. Medication status is based on user or caregiver input. Notifications and email delivery may be simulated in demo mode.

## Future Improvements

- SMS, WhatsApp, or voice-call notifications
- More accessible interfaces for elderly users
- Improved medication history and reporting
- Integration with verified healthcare providers

## Project

**Saath**  
Care, together. Quiet until it matters.
