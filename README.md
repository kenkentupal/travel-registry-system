# TVTAP: Tourist Vehicle and Travel Association of the Philippines

TVTAP is a comprehensive web-based management platform designed for the Tourist Vehicle and Travel Association of the Philippines. It streamlines the administration of tourist vehicles, organizations, user profiles, and QR-based vehicle verification, providing a modern, secure, and user-friendly dashboard for both administrators and members.

## Features

- **Dashboard Overview**: Visual analytics for registered and active vehicles, monthly statistics, and QR scan data.
- **User Management**: Invite users, assign roles (President, Member, Driver, etc.), and manage user profiles across organizations.
- **Vehicle Management**: Register, approve, and track vehicles, including insurance documentation and QR code generation for each vehicle.
- **Organization Management**: Add, edit, and view travel organizations, with detailed descriptions and creation logs.
- **QR Code System**: Generate and scan official vehicle QR codes for quick verification and access to vehicle details.
- **Authentication**: Secure sign-in and role-based access control for different user types.
- **Modern UI/UX**: Clean, responsive interface with dark mode support, built using React and Tailwind CSS.

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express (see `/server` directory)
- **Database & Auth**: Supabase
- **Charts & Visualization**: ApexCharts, FullCalendar
- **Other Libraries**: React Router, Axios, QRCode.react, Headless UI, and more

## Getting Started

### Prerequisites
- Node.js 18.x or later (Node.js 20.x recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/tvtap.git
   cd tvtap/client
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your Supabase and API details.
4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. **Access the app:**
   - Open [http://localhost:5173](http://localhost:5173) in your browser.

### Backend Setup
- See `/server/README.md` for backend API setup and configuration.

## Screenshots

| Dashboard | Invites | Organizations | Vehicles | QR Details | Sign In | User List |
|-----------|---------|--------------|----------|------------|---------|-----------|
| ![Dashboard](screenshots/dashboard.png) | ![Invites](screenshots/invites.png) | ![Organizations](screenshots/organizations.png) | ![Vehicles](screenshots/vehicles.png) | ![QR](screenshots/qr.png) | ![Sign In](screenshots/signin.png) | ![User List](screenshots/userlist.png) |

## Folder Structure

- `/client` - Frontend React app
- `/server` - Backend API (Node.js/Express)
- `/screenshots` - UI screenshots for documentation

## License

This project is licensed under the MIT License. See [LICENSE.md](client/LICENSE.md) for details.

## Credits

- Developed by Ken Tupal and contributors
- UI based on TailAdmin React Template
- Special thanks to the Tourist Vehicle and Travel Association of the Philippines

## Contact & Support

For questions, support, or contributions, please open an issue or contact the maintainer via GitHub.
