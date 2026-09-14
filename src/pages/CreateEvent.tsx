import { useState } from "react";
import { supabase } from "../lib/supabase";

type CreateEventProps = {
  onBack: () => void;
  onCreated: () => void;
};

export default function CreateEvent({
  onBack,
  onCreated,
}: CreateEventProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [rows, setRows] = useState("5");
  const [cols, setCols] = useState("10");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const rowCount = Number(rows);
    const colCount = Number(cols);
    const ticketPrice = Number(price);

    if (!title.trim()) {
      setError("Please enter an event title.");
      return;
    }

    if (!venue.trim()) {
      setError("Please enter a venue.");
      return;
    }

    if (!date || !time) {
      setError("Please select the event date and time.");
      return;
    }

    const startsAt = new Date(`${date}T${time}`);

    if (Number.isNaN(startsAt.getTime())) {
      setError("Please enter a valid date and time.");
      return;
    }

    if (startsAt <= new Date()) {
      setError("Event date and time must be in the future.");
      return;
    }

    if (
      price === "" ||
      Number.isNaN(ticketPrice) ||
      ticketPrice < 0
    ) {
      setError("Ticket price must be 0 or more.");
      return;
    }

    if (
      !Number.isInteger(rowCount) ||
      rowCount < 1 ||
      rowCount > 20
    ) {
      setError("Rows must be between 1 and 20.");
      return;
    }

    if (
      !Number.isInteger(colCount) ||
      colCount < 1 ||
      colCount > 20
    ) {
      setError("Columns must be between 1 and 20.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "You must be logged in to create an event."
        );
      }

      const { error: insertError } = await supabase
        .from("events")
        .insert({
          owner_id: user.id,
          title: title.trim(),
          description: description.trim(),
          venue: venue.trim(),
          starts_at: startsAt.toISOString(),
          price: ticketPrice,
          rows: rowCount,
          cols: colCount,
        });

      if (insertError) {
        throw insertError;
      }

      setSuccess("Event created successfully! 🎉");

      setTimeout(() => {
        onCreated();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create event."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="create-page">
      <div className="create-card">

        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to Events
        </button>

        <div className="create-header">
          <div className="create-icon">
            🎟️
          </div>

          <h1>Create Event</h1>

          <p className="subtitle">
            Create your event and automatically generate
            the seating layout.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="create-form"
        >

          <div className="form-group">
            <label htmlFor="title">
              Event Title *
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. College Cultural Fest"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Tell attendees about your event"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="venue">
              Venue *
            </label>

            <input
              id="venue"
              type="text"
              value={venue}
              onChange={(e) =>
                setVenue(e.target.value)
              }
              placeholder="e.g. Main Auditorium"
            />
          </div>

          <div className="two-columns">

            <div className="form-group">
              <label htmlFor="date">
                Event Date *
              </label>

              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">
                Event Time *
              </label>

              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) =>
                  setTime(e.target.value)
                }
              />
            </div>

          </div>

          <div className="form-group">
            <label htmlFor="price">
              Ticket Price (₹) *
            </label>

            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value)
              }
              placeholder="0 for free event"
            />

            <small>
              Enter 0 if the event is free.
            </small>
          </div>

          <div className="two-columns">

            <div className="form-group">
              <label htmlFor="rows">
                Rows *
              </label>

              <input
                id="rows"
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) =>
                  setRows(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="cols">
                Columns *
              </label>

              <input
                id="cols"
                type="number"
                min="1"
                max="20"
                value={cols}
                onChange={(e) =>
                  setCols(e.target.value)
                }
              />
            </div>

          </div>

          <div className="seat-preview">
            <span>💺</span>

            <div>
              <strong>
                {Number(rows) * Number(cols)} seats
              </strong>

              <p>
                Seats will be automatically generated
                from A1 onwards.
              </p>
            </div>
          </div>

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

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Creating Event..."
              : "Create Event"}
          </button>

        </form>
      </div>
    </main>
  );
}