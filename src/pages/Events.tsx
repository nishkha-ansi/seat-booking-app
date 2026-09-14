import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import SeatMap from "./SeatMap";

type Event = {
  id: string;
  title: string;
  description: string;
  venue: string;
  starts_at: string;
  price: number;
  rows: number;
  cols: number;
};

type EventsProps = {
  onCreateEvent: () => void;
  onMyBookings: () => void;
  onDashboard: () => void;
};

export default function Events({
  onCreateEvent,
  onMyBookings,
  onDashboard,
}: EventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedEvent, setSelectedEvent] =
    useState<Event | null>(null);

  async function loadEvents() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gt(
        "starts_at",
        new Date().toISOString()
      )
      .order("starts_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Events error:",
        error
      );
      setError(error.message);
    } else {
      setEvents(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  if (selectedEvent) {
    return (
      <SeatMap
        eventId={selectedEvent.id}
        eventTitle={selectedEvent.title}
        price={Number(selectedEvent.price)}
        venue={selectedEvent.venue}
        startsAt={selectedEvent.starts_at}
        onBack={() =>
          setSelectedEvent(null)
        }
      />
    );
  }

  return (
    <main className="events-page">

      <header className="topbar">

        <div>
          <h1>🎟️ SeatBook</h1>
          <p>Find your next experience</p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >

          <button
            type="button"
            className="create-button"
            onClick={onMyBookings}
          >
            🎟️ My Bookings
          </button>

          <button
            type="button"
            className="create-button"
            onClick={onDashboard}
          >
            📊 Dashboard
          </button>

          <button
            type="button"
            onClick={logout}
            className="logout-button"
          >
            Log Out
          </button>

        </div>

      </header>

      <section className="events-container">

        <div className="page-heading">

          <div>
            <h2>Upcoming Events</h2>

            <p>
              Choose an event and book your seats.
            </p>
          </div>

          <button
            type="button"
            className="create-button"
            onClick={onCreateEvent}
          >
            + Create Event
          </button>

        </div>

        {loading && (
          <div className="state-box">
            Loading events...
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {!loading &&
          !error &&
          events.length === 0 && (
            <div className="empty-box">

              <div className="empty-icon">
                🎭
              </div>

              <h3>
                No upcoming events
              </h3>

              <p>
                Be the first to create an event!
              </p>

            </div>
          )}

        <div className="events-grid">

          {events.map((event) => (
            <article
              className="event-card"
              key={event.id}
            >

              <div className="event-image">
                🎫
              </div>

              <div className="event-content">

                <h3>
                  {event.title}
                </h3>

                <p className="event-description">
                  {event.description ||
                    "No description provided."}
                </p>

                <div className="event-info">

                  <span>
                    📍 {event.venue}
                  </span>

                  <span>
                    📅{" "}
                    {new Date(
                      event.starts_at
                    ).toLocaleString(
                      "en-IN",
                      {
                        dateStyle:
                          "medium",
                        timeStyle:
                          "short",
                      }
                    )}
                  </span>

                  <span>
                    💺 {event.rows} ×{" "}
                    {event.cols} seats
                  </span>

                </div>

                <div className="event-footer">

                  <strong>
                    {Number(
                      event.price
                    ) === 0
                      ? "FREE"
                      : `₹${Number(
                          event.price
                        ).toFixed(2)}`}
                  </strong>

                  <button
                    type="button"
                    className="book-button"
                    onClick={() =>
                      setSelectedEvent(event)
                    }
                  >
                    View Seats
                  </button>

                </div>

              </div>

            </article>
          ))}

        </div>

      </section>

    </main>
  );
}
<footer className="site-footer">
  Created by <strong>Nishkha</strong>
</footer>