import { Route } from "react-router-dom";
import SignIn from "../pages/AuthPages/SignIn";
import SignUp from "../pages/AuthPages/SignUp";
import InviteAccept from "../pages/AuthPages/EmailConfirmation";
import AccountConfirmation from "../pages/AuthPages/AccountConfirmation";
import QRView from "../pages/Vehicles/QRView";

export default function PublicRoutes() {
  return (
    <>
      <Route path="/accountconfirmation" element={<AccountConfirmation />} />
      <Route path="/vehicle/:id" element={<QRView />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/invite" element={<InviteAccept />} />
    </>
  );
}
