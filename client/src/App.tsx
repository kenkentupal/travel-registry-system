import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSession } from "./hooks/useSession";
import { useMarkInviteAsAccepted } from "./hooks/useMarkInviteAsAccepted";
import { SearchProvider } from "./context/SearchContext";
import { ScrollToTop } from "./components/common/ScrollToTop";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import { Toaster } from "react-hot-toast";

// Pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import InviteAccept from "./pages/AuthPages/EmailConfirmation";
import Home from "./pages/Dashboard/Home";
import VehicleRegistry from "./pages/Vehicles/VehicleRegistry";
import QRView from "./pages/Vehicles/QRView";
import UserProfiles from "./pages/UserProfiles";
import OrganizationTable from "./pages/Organization/OrganizationForm";
import Calendar from "./pages/Calendar";
import Invites from "./pages/Users/Invites";
import List from "./pages/Users/List";
import AppLayout from "./layout/AppLayout";

export default function App() {
  const session = useSession();

  useMarkInviteAsAccepted(session);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/vehicle/:id" element={<QRView />} />
        <Route
          path="/signin"
          element={session ? <Navigate to="/" replace /> : <SignIn />}
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/invite" element={<InviteAccept />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <SearchProvider>
                <AppLayout />
                <Toaster position="top-right" reverseOrder={false} />
              </SearchProvider>
            </ProtectedRoute>
          }
        >
          {/* Accessible to all logged-in roles */}
          <Route index path="/" element={<Home />} />
          <Route path="/vehicles" element={<VehicleRegistry />} />

          {/* CEO and President only */}
          <Route
            path="/user-invites"
            element={
              <RoleRoute allowedRoles={["CEO", "President", "Developer"]}>
                <Invites />
              </RoleRoute>
            }
          />
          <Route
            path="/list"
            element={
              <RoleRoute allowedRoles={["CEO", "President", "Developer"]}>
                <List />
              </RoleRoute>
            }
          />
          <Route
            path="/organizations"
            element={
              <RoleRoute allowedRoles={["CEO", "President", "Developer"]}>
                <OrganizationTable />
              </RoleRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={["CEO", "President", "Developer"]}>
                <UserProfiles />
              </RoleRoute>
            }
          />
          {/* <Route
            path="/calendar"
            element={
              <RoleRoute
                allowedRoles={[
                  "CEO",
                  "President",
                  "Developer",
                  "Member",
                  "Driver",
                ]}
              >
                <Calendar />
              </RoleRoute>
            }
          /> */}
        </Route>
      </Routes>
    </Router>
  );
}
