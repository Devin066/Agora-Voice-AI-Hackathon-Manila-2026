import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import BHWApp from "./pages/BHWApp";
import NurseDashboard from "./pages/NurseDashboard";
import PatientListPage from "./pages/PatientListPage";
import PatientApp from "./pages/PatientApp";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null; // brief loading flash

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BHWApp session={session} />} />
        <Route path="/patients" element={<PatientListPage session={session} />} />
        <Route path="/nurse" element={<NurseDashboard session={session} />} />
        <Route path="/triage-form" element={<PatientApp />} />
      </Routes>
    </BrowserRouter>
  );
}
