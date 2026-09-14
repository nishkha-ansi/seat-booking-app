import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Bill from "./Bill";

type Seat = {
  id: string;
  label: string;
  is_booked: boolean;
};

type SeatMapProps = {
  eventId: string;
  eventTitle: string;
  price: number;
  venue?: string;
  startsAt?: string;
  onBack: () => void;
};

export default function SeatMap({
  eventId,
  eventTitle,
  price,
  venue = "Event Venue",
  startsAt = "",
  onBack,
}: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] =
    useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showBill, setShowBill] = useState(false);

  async function loadSeats() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase.rpc(
      "get_event_seats",
      {
        p_event_id: eventId,
      }
    );

    if (error) {
      console.error("Seat loading error:", error);
      setError(error.message);
    } else {
      setSeats(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSeats();
  }, [eventId]);

  function toggleSeat(seat: Seat) {
    if (seat.is_booked || booking) {
      return;
    }

    setError("");
    setSuccess("");

    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats(
        selectedSeats.filter(
          (id) => id !== seat.id
        )
      );
      return;
    }

    if (selectedSeats.length >= 4) {
      setError(
        "You can book a maximum of 4 seats."
      );
      return;
    }

    setSelectedSeats([
      ...selectedSeats,
      seat.id,
    ]);
  }

  function openBill() {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat.");
      return;
    }

    setError("");
    setSuccess("");
    setShowBill(true);
  }

  async function confirmBooking() {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat.");
      setShowBill(false);
      return;
    }

    setBooking(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.rpc(
      "book_seats",
      {
        p_event_id: eventId,
        p_seat_ids: selectedSeats,
      }
    );

    if (error) {
      console.error("Booking error:", error);

      setError(error.message);

      setShowBill(false);

      await loadSeats();

      setSelectedSeats([]);
    } else {
      setSuccess(
        "Booking confirmed successfully! 🎉"
      );

      setSelectedSeats([]);

      setShowBill(false);

      await loadSeats();
    }

    setBooking(false);
  }

  const selectedSeatObjects = seats.filter(
    (seat) =>
      selectedSeats.includes(seat.id)
  );

  const selectedSeatLabels =
    selectedSeatObjects.map(
      (seat) => seat.label
    );

  const totalPrice =
    selectedSeats.length * Number(price);

  if (showBill) {
    return (
      <Bill
        eventTitle={eventTitle}
        venue={venue}
        startsAt={startsAt}
        price={Number(price)}
        selectedSeats={selectedSeatLabels}
        onBack={() => setShowBill(false)}
        onConfirm={confirmBooking}
        loading={booking}
      />
    );
  }

  return (
    <main className="seat-page">
      <div className="seat-container">

        <button
          type="button"
          className="back-button"
          onClick={onBack}
          disabled={booking}
        >
          ← Back to Events
        </button>

        <div className="seat-header">
          <h1>{eventTitle}</h1>

          <p>
            Select up to 4 seats
          </p>
        </div>

        <div className="seat-legend">

          <div>
            <span className="legend-seat available"></span>
            Available
          </div>

          <div>
            <span className="legend-seat selected"></span>
            Selected
          </div>

          <div>
            <span className="legend-seat booked"></span>
            Booked
          </div>

        </div>

        <div className="screen">
          SCREEN
        </div>

        {loading && (
          <div className="state-box">
            Loading seats...
          </div>
        )}

        {!loading && !error && (
          <div className="seat-map">
            {seats.map((seat) => {

              const isSelected =
                selectedSeats.includes(
                  seat.id
                );

              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={seat.is_booked}
                  onClick={() =>
                    toggleSeat(seat)
                  }
                  className={`seat ${
                    seat.is_booked
                      ? "booked"
                      : isSelected
                      ? "selected"
                      : "available"
                  }`}
                >
                  {seat.label}
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}

        <div className="booking-summary">

          <div>
            <span>
              Selected seats
            </span>

            <strong>
              {selectedSeatLabels.length > 0
                ? selectedSeatLabels.join(", ")
                : "None"}
            </strong>
          </div>

          <div>
            <span>Total</span>

            <strong>
              {totalPrice === 0
                ? "FREE"
                : `₹${totalPrice.toFixed(2)}`}
            </strong>
          </div>

          <button
            type="button"
            className="confirm-button"
            disabled={
              booking ||
              selectedSeats.length === 0
            }
            onClick={openBill}
          >
            Review Bill
          </button>

        </div>

      </div>
    </main>
  );
}