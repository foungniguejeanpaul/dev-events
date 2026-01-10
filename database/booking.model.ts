import { Schema, model, models, Document, Model, Types } from "mongoose";
import { Event } from "./event.model";

/**
 * Booking document shape used by Mongoose and TypeScript.
 */
export interface BookingDocument extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Simple email format validator.
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<BookingDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required."],
      index: true, // index for faster lookups by event
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => emailRegex.test(value),
        message: "Email must be a valid email address.",
      },
    },
  },
  {
    timestamps: true, // automatically manages createdAt and updatedAt
  }
);

// Explicit index on eventId for query performance.
BookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook: validate referenced event and email.
 * - Ensures the event exists before creating a booking.
 */
BookingSchema.pre("save", async function (next) {
  try {
    // Verify that the referenced event exists.
    const existingEvent = await Event.exists({ _id: this.eventId });
    if (!existingEvent) {
      return next(new Error("Cannot create booking: referenced event does not exist."));
    }

    // Email format is already validated by schema, but this ensures
    // an early, explicit error in edge cases.
    if (!emailRegex.test(this.email)) {
      return next(new Error("Email must be a valid email address."));
    }

    return next();
  } catch (error) {
    return next(error as Error);
  }
});

export type BookingModel = Model<BookingDocument>;

export const Booking: BookingModel =
  (models.Booking as BookingModel | undefined) ||
  model<BookingDocument>("Booking", BookingSchema);
