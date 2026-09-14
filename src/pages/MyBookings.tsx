import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Booking = {
  id: string;
  event_id: string;
  seat_id: string;
  status: string;
  created_at: string;

  events: {
    title: string;
    venue: string;
    starts_at: string;
    price: number;
  };

  seats: {
    label: string;
  };
};

type MyBookingsProps = {
  onBack: () => void;
};

export default function MyBookings({
  onBack,
}: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] =
    useState<string | null>(null);

  async function loadBookings() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        event_id,
        seat_id,
        status,
        created_at,
        events (
          title,
          venue,
          starts_at,
          price
        ),
        seats (
          label
        )
      `)
      .eq("status", "booked")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Bookings error:",
        error
      );

      setError(error.message);
      setBookings([]);
    } else {
      setBookings(
        (data as unknown as Booking[]) ?? []
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function cancelBooking(
    bookingId: string
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    setCancelling(bookingId);
    setError("");

    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
      })
      .eq("id", bookingId)
      .eq("status", "booked");

    if (error) {
      console.error(
        "Cancellation error:",
        error
      );

      setError(error.message);
    } else {
      await loadBookings();
    }

    setCancelling(null);
  }

  return (
    <main className="bookings-page">
      <div className="bookings-container">

        {/* BACK */}
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to Events
        </button>

        {/* HEADER */}
        <header className="bookings-header">
          <div>
            <p
              style={{
                margin: 0,
                color: "#ed3b83",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "1.5px",
              }}
            >
              YOUR TICKETS
            </p>

            <h1>My Bookings</h1>

            <p>
              View and manage your upcoming
              bookings.
            </p>
          </div>

          <button
            type="button"
            className="create-button"
            onClick={loadBookings}
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
            Loading your bookings...
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          bookings.length === 0 && (
            <div className="empty-box">

              <div className="empty-icon">
                🎟️
              </div>

              <h3>
                No active bookings
              </h3>

              <p>
                Your confirmed bookings will
                appear here.
              </p>

            </div>
          )}

        {/* BOOKINGS */}
        {!loading &&
          bookings.length > 0 && (
            <div className="bookings-list">

              {bookings.map((booking) => {

                const eventStarted =
                  new Date(
                    booking.events.starts_at
                  ) <= new Date();

                return (
                  <article
                    className="booking-card"
                    key={booking.id}
                  >

                    {/* ICON */}
                    <div className="booking-icon">
                      🎫
                    </div>

                    {/* DETAILS */}
                    <div className="booking-details">

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "10px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <h2>
                          {
                            booking.events
                              .title
                          }
                        </h2>

                        <span
                          style={{
                            padding:
                              "5px 9px",
                            borderRadius:
                              "999px",
                            background:
                              "#edfdf4",
                            color:
                              "#15803d",
                            fontSize:
                              "10px",
                            fontWeight:
                              800,
                          }}
                        >
                          CONFIRMED
                        </span>
                      </div>

                      <p>
                        📍{" "}
                        {
                          booking.events
                            .venue
                        }
                      </p>

                      <p>
                        📅{" "}
                        {new Date(
                          booking.events.starts_at
                        ).toLocaleString(
                          "en-IN",
                          {
                            dateStyle:
                              "medium",
                            timeStyle:
                              "short",
                          }
                        )}
                      </p>

                      <div className="booking-seat">
                        💺 Seat{" "}
                        <strong>
                          {
                            booking.seats
                              .label
                          }
                        </strong>
                      </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="booking-actions">

                      <strong>
                        {Number(
                          booking.events
                            .price
                        ) === 0
                          ? "FREE"
                          : `₹${Number(
                              booking.events
                                .price
                            ).toFixed(2)}`}
                      </strong>

                      {!eventStarted ? (
                        <button
                          type="button"
                          className="cancel-button"
                          disabled={
                            cancelling ===
                            booking.id
                          }
                          onClick={() =>
                            cancelBooking(
                              booking.id
                            )
                          }
                        >
                          {cancelling ===
                          booking.id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      ) : (
                        <span
                          style={{
                            color:
                              "#9999a6",
                            fontSize:
                              "12px",
                            fontWeight:
                              700,
                          }}
                        >
                          Event started
                        </span>
                      )}

                    </div>

                  </article>
                );
              })}

            </div>
          )}

      </div>
    </main>
  );
}