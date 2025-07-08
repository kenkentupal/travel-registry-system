import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSession } from "./hooks/useSession";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/Vehicles/QRView";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import VehicleRegistry from "./pages/Vehicles/VehicleRegistry";
import QRView from "./pages/Vehicles/QRView";
import ProtectedRoute from "./routes/ProtectedRoute";
import UserTable from "./pages/Users/UserTable";
import InviteAccept from "./pages/AuthPages/EmailConfirmation";
import AccountConfirmation from "./pages/AuthPages/AccountConfirmation";
import OrganizationTable from "./pages/Organization/OrganizationTable";
import { useMarkInviteAsAccepted } from "./hooks/useMarkInviteAsAccepted";

export default function App() {
  const session = useSession(); // Using the custom hook
  useMarkInviteAsAccepted(session);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* public routes */}
        <Route path="/accountconfirmation" element={<AccountConfirmation />} />
        <Route path="/vehicle/:id" element={<QRView />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/invite" element={<InviteAccept />} />

        {/* protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index path="/" element={<Home />} />
          <Route path="/vehicles" element={<VehicleRegistry />} />
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/organizations" element={<OrganizationTable />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />
          <Route path="/form-elements" element={<FormElements />} />
          <Route path="/basic-tables" element={<BasicTables />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
          <Route path="/user-invites" element={<UserTable />} />
        </Route>
      </Routes>
    </Router>
  );
}
