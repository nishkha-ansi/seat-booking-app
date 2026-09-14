type BillProps = {
  eventTitle: string;
  venue: string;
  startsAt: string;
  price: number;
  selectedSeats: string[];
  onBack: () => void;
  onConfirm: () => void;
  loading: boolean;
};

export default function Bill({
  eventTitle,
  venue,
  startsAt,
  price,
  selectedSeats,
  onBack,
  onConfirm,
  loading,
}: BillProps) {
  const subtotal =
    selectedSeats.length * Number(price);

  const total = subtotal;

  return (
    <main className="bill-page">
      <div className="bill-container">

        <button
          type="button"
          className="back-button"
          onClick={onBack}
          disabled={loading}
        >
          ← Back to Seats
        </button>

        <div className="bill-header">
          <div className="bill-ticket-icon">
            🎟️
          </div>

          <h1>Review Your Booking</h1>

          <p>
            Check your details before confirming
            your seats.
          </p>
        </div>

        <section className="bill-card">

          <div className="bill-event">
            <div>
              <span>EVENT</span>
              <h2>{eventTitle}</h2>
            </div>

            <div className="bill-price-tag">
              ₹{Number(price).toFixed(2)}
              <small> / seat</small>
            </div>
          </div>

          <div className="bill-divider"></div>

          <div className="bill-info-grid">

            <div>
              <span>📍 Venue</span>
              <strong>{venue}</strong>
            </div>

            <div>
              <span>📅 Date & Time</span>
              <strong>
                {new Date(
                  startsAt
                ).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </strong>
            </div>

          </div>

          <div className="bill-divider"></div>

          <div className="bill-seats-section">
            <div className="bill-section-title">
              <span>💺 Selected Seats</span>
              <strong>
                {selectedSeats.length} seat
                {selectedSeats.length !== 1
                  ? "s"
                  : ""}
              </strong>
            </div>

            <div className="bill-seats">
              {selectedSeats.map((seat) => (
                <span
                  className="bill-seat"
                  key={seat}
                >
                  {seat}
                </span>
              ))}
            </div>
          </div>

          <div className="bill-divider"></div>

          <div className="bill-summary">

            <div>
              <span>Ticket Price</span>
              <strong>
                ₹{Number(price).toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Number of Seats</span>
              <strong>
                × {selectedSeats.length}
              </strong>
            </div>

            <div>
              <span>Subtotal</span>
              <strong>
                ₹{subtotal.toFixed(2)}
              </strong>
            </div>

            <div className="bill-total">
              <span>Total Amount</span>
              <strong>
                {total === 0
                  ? "FREE"
                  : `₹${total.toFixed(2)}`}
              </strong>
            </div>

          </div>

          <div className="bill-note">
            🔒 Your seats will be secured only after
            you confirm the booking.
          </div>

          <button
            type="button"
            className="bill-confirm-button"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? "Confirming Booking..."
              : total === 0
              ? "Confirm Free Booking"
              : `Confirm & Book • ₹${total.toFixed(2)}`}
          </button>

        </section>

      </div>
    </main>
  );
}