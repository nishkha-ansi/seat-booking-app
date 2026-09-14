import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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

type DashboardEvent = Event & {
  soldSeats: number;
  totalSeats: number;
  revenue: number;
  attendees: number;
};

type OrganizerDashboardProps = {
  onBack: () => void;
};

export default function OrganizerDashboard({
  onBack,
}: OrganizerDashboardProps) {
  const [events, setEvents] = useState<DashboardEvent[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }

      // Get events created by the current user
      const {
        data: eventData,
        error: eventError,
      } = await supabase
        .from("events")
        .select("*")
        .eq("owner_id", user.id)
        .order("starts_at", {
          ascending: true,
        });

      if (eventError) {
        throw eventError;
      }

      const userEvents = (eventData ?? []) as Event[];

      if (userEvents.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      const eventIds = userEvents.map(
        (event) => event.id
      );

      // Get bookings for the organiser's events
      const {
        data: bookingData,
        error: bookingError,
      } = await supabase
        .from("bookings")
        .select(
          "id, event_id, seat_id, user_id, status"
        )
        .in("event_id", eventIds);

      if (bookingError) {
        throw bookingError;
      }

      const bookings = bookingData ?? [];

      // Calculate statistics for every event
      const dashboardEvents: DashboardEvent[] =
        userEvents.map((event) => {
          const totalSeats =
            Number(event.rows) *
            Number(event.cols);

          const eventBookings = bookings.filter(
            (booking) =>
              booking.event_id === event.id &&
              booking.status === "booked"
          );

          const soldSeats =
            eventBookings.length;

          const revenue =
            soldSeats *
            Number(event.price);

          const uniqueUsers = new Set(
            eventBookings.map(
              (booking) => booking.user_id
            )
          );

          return {
            ...event,
            soldSeats,
            totalSeats,
            revenue,
            attendees: uniqueUsers.size,
          };
        });

      setEvents(dashboardEvents);
    } catch (err: any) {
      console.error(
        "Dashboard error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load dashboard."
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalEvents = events.length;

  const totalSeatsSold = events.reduce(
    (sum, event) =>
      sum + event.soldSeats,
    0
  );

  const totalRevenue = events.reduce(
    (sum, event) =>
      sum + event.revenue,
    0
  );

  const totalAttendees = events.reduce(
    (sum, event) =>
      sum + event.attendees,
    0
  );

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">

        {/* TOP */}
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to Events
        </button>

        {/* HEADER */}
        <header className="dashboard-header">

          <div>
            <p className="dashboard-eyebrow">
              ORGANIZER PANEL
            </p>

            <h1>
              Event Dashboard
            </h1>

            <p>
              Track your events, bookings,
              attendees and revenue.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-refresh"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>

        </header>

        {/* ERROR */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="state-box">
            Loading dashboard...
          </div>
        )}

        {!loading && !error && (
          <>
            {/* STAT CARDS */}
            <section className="stats-grid">

              <article className="stat-card">
                <div className="stat-icon">
                  🎟️
                </div>

                <div>
                  <span>
                    Total Events
                  </span>

                  <strong>
                    {totalEvents}
                  </strong>
                </div>
              </article>

              <article className="stat-card">
                <div className="stat-icon">
                  💺
                </div>

                <div>
                  <span>
                    Seats Sold
                  </span>

                  <strong>
                    {totalSeatsSold}
                  </strong>
                </div>
              </article>

              <article className="stat-card">
                <div className="stat-icon">
                  👥
                </div>

                <div>
                  <span>
                    Attendees
                  </span>

                  <strong>
                    {totalAttendees}
                  </strong>
                </div>
              </article>

              <article className="stat-card">
                <div className="stat-icon">
                  ₹
                </div>

                <div>
                  <span>
                    Revenue
                  </span>

                  <strong>
                    ₹
                    {totalRevenue.toFixed(
                      2
                    )}
                  </strong>
                </div>
              </article>

            </section>

            {/* EVENTS */}
            <section className="dashboard-section">

              <div className="section-heading">
                <div>
                  <h2>
                    Your Events
                  </h2>

                  <p>
                    Sales performance for
                    every event you created.
                  </p>
                </div>

                <span>
                  {totalEvents} event
                  {totalEvents !== 1
                    ? "s"
                    : ""}
                </span>
              </div>

              {events.length === 0 ? (
                <div className="empty-box">

                  <div className="empty-icon">
                    🎭
                  </div>

                  <h3>
                    No events created yet
                  </h3>

                  <p>
                    Create your first event
                    to see organiser
                    statistics here.
                  </p>

                </div>
              ) : (
                <div className="dashboard-events">

                  {events.map((event) => {

                    const percentage =
                      event.totalSeats > 0
                        ? Math.min(
                            100,
                            (event.soldSeats /
                              event.totalSeats) *
                              100
                          )
                        : 0;

                    const isPast =
                      new Date(
                        event.starts_at
                      ) <= new Date();

                    return (
                      <article
                        className="dashboard-event-card"
                        key={event.id}
                      >

                        {/* EVENT TOP */}
                        <div className="dashboard-event-top">

                          <div>
                            <h3>
                              {event.title}
                            </h3>

                            <p>
                              {event.description ||
                                "No description provided."}
                            </p>
                          </div>

                          <span
                            className={`event-status ${
                              isPast
                                ? "past"
                                : "upcoming"
                            }`}
                          >
                            {isPast
                              ? "Past"
                              : "Upcoming"}
                          </span>

                        </div>

                        {/* EVENT INFO */}
                        <div className="dashboard-event-info">

                          <span>
                            📍{" "}
                            {event.venue}
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
                            💺{" "}
                            {event.totalSeats}{" "}
                            seats
                          </span>

                          <strong className="dashboard-event-price">
                            {Number(
                              event.price
                            ) === 0
                              ? "FREE"
                              : `₹${Number(
                                  event.price
                                ).toFixed(2)} / seat`}
                          </strong>

                        </div>

                        {/* SALES PROGRESS */}
                        <div className="sales-progress">

                          <div className="progress-label">

                            <span>
                              Seat Sales
                            </span>

                            <strong>
                              {
                                event.soldSeats
                              } /{" "}
                              {
                                event.totalSeats
                              }
                            </strong>

                          </div>

                          <div className="progress-bar">

                            <div
                              className="progress-fill"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>

                        {/* STATS */}
                        <div className="dashboard-event-stats">

                          <div>
                            <span>
                              Seats Sold
                            </span>

                            <strong>
                              {
                                event.soldSeats
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              Attendees
                            </span>

                            <strong>
                              {
                                event.attendees
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              Revenue
                            </span>

                            <strong>
                              ₹
                              {event.revenue.toFixed(
                                2
                              )}
                            </strong>
                          </div>

                        </div>

                      </article>
                    );
                  })}

                </div>
              )}

            </section>
          </>
        )}

      </div>
    </main>
  );
}