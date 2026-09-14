import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

import Auth from "./pages/Auth";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import MyBookings from "./pages/MyBookings";
import OrganizerDashboard from "./pages/OrganizerDashboard";

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showCreateEvent, setShowCreateEvent] =
    useState(false);

  const [showMyBookings, setShowMyBookings] =
    useState(false);

  const [showDashboard, setShowDashboard] =
    useState(false);

  useEffect(() => {
    async function loadSession() {
      const { data, error } =
        await supabase.auth.getSession();

      if (error) {
        console.error(
          "Session error:",
          error
        );
      }

      setSession(data.session);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  console.log(
    "Dashboard state:",
    showDashboard
  );

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #eef2ff, #fdf2f8)",
          fontSize: "24px",
          fontWeight: 600,
        }}
      >
        Loading...
      </main>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (showCreateEvent) {
    return (
      <CreateEvent
        onBack={() =>
          setShowCreateEvent(false)
        }
        onCreated={() =>
          setShowCreateEvent(false)
        }
      />
    );
  }

  if (showMyBookings) {
    return (
      <MyBookings
        onBack={() =>
          setShowMyBookings(false)
        }
      />
    );
  }

  if (showDashboard) {
    return (
      <OrganizerDashboard
        onBack={() =>
          setShowDashboard(false)
        }
      />
    );
  }

  return (
    <Events
      onCreateEvent={() =>
        setShowCreateEvent(true)
      }
      onMyBookings={() =>
        setShowMyBookings(true)
      }
      onDashboard={() => {
        console.log("Dashboard button clicked");
        setShowDashboard(true);
      }}
    />
  );
}

export default App;