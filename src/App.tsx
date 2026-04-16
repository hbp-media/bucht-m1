import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Booking from "./pages/Booking.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Verify from "./pages/Verify.tsx";
import Pending from "./pages/Pending.tsx";
import BookingSystem from "./pages/BookingSystem.tsx";
import Account from "./pages/Account.tsx";
import Admin from "./pages/Admin.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Teichordnung from "./pages/Teichordnung.tsx";
import Anfahrt from "./pages/Anfahrt.tsx";
import Impressum from "./pages/Impressum.tsx";
import Kontakt from "./pages/Kontakt.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/pending" element={<Pending />} />
            <Route path="/booking-system" element={<BookingSystem />} />
            <Route path="/account" element={<Account />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/teichordnung" element={<Teichordnung />} />
            <Route path="/anfahrt" element={<Anfahrt />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/kontakt" element={<Kontakt />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
