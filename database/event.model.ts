import { Schema, model, models, Document, Model } from "mongoose";

/**
 * Event document shape used by Mongoose and TypeScript.
 */
export interface EventDocument extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Basic non-empty string validator.
 */
const nonEmptyString = {
  validator: (value: string): boolean =>
    typeof value === "string" && value.trim().length > 0,
  message: "Field is required and cannot be empty.",
};

/**
 * Generates a URL-friendly slug from a title.
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Normalize a date string to YYYY-MM-DD (ISO date without time).
 */
function normalizeDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid event date provided.");
  }
  return date.toISOString().slice(0, 10);
}

/**
 * Normalize time to HH:mm (24-hour) format.
 */
function normalizeTime(timeStr: string): string {
  const trimmed = timeStr.trim();

  const hhmmMatch = /^(\d{2}):(\d{2})$/.exec(trimmed);
  if (hhmmMatch) {
    const hours = Number(hhmmMatch[1]);
    const minutes = Number(hhmmMatch[2]);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${hhmmMatch[1]}:${hhmmMatch[2]}`;
    }
  }

  const ampmMatch = /^(\d{1,2}):(\d{2})\s*([ap]m)$/i.exec(trimmed);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = Number(ampmMatch[2]);
    const period = ampmMatch[3].toLowerCase();

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      throw new Error("Invalid event time provided.");
    }

    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  throw new Error("Event time must be in HH:mm or h:mm am/pm format.");
}

const EventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, validate: nonEmptyString, trim: true },
    slug: { type: String, required: true, unique: true, trim: true }, // ✅ unique = index unique, pas index: true
    description: { type: String, required: true, validate: nonEmptyString, trim: true },
    overview: { type: String, required: true, validate: nonEmptyString, trim: true },
    image: { type: String, required: true, validate: nonEmptyString, trim: true },
    venue: { type: String, required: true, validate: nonEmptyString, trim: true },
    location: { type: String, required: true, validate: nonEmptyString, trim: true },
    date: { type: String, required: true, validate: nonEmptyString, trim: true },
    time: { type: String, required: true, validate: nonEmptyString, trim: true },
    mode: { type: String, required: true, validate: nonEmptyString, trim: true },
    audience: { type: String, required: true, validate: nonEmptyString, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((v) => typeof v === "string" && v.trim().length > 0),
        message: "Agenda must be a non-empty array of non-empty strings.",
      },
    },
    organizer: { type: String, required: true, validate: nonEmptyString, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((v) => typeof v === "string" && v.trim().length > 0),
        message: "Tags must be a non-empty array of non-empty strings.",
      },
    },
  },
  { timestamps: true }
);

/**
 * Pre-validation hook:
 * - Generate slug before validation
 * - Normalize date and time
 */
EventSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = generateSlug(this.title);
  }

  if (this.isModified("date")) {
    this.date = normalizeDate(this.date);
  }

  if (this.isModified("time")) {
    this.time = normalizeTime(this.time);
  }

  next();
});

// ❌ Supprime l’index en double, `unique: true` suffit
// EventSchema.index({ slug: 1 }, { unique: true });

export type EventModel = Model<EventDocument>;

export const Event: EventModel =
  (models.Event as EventModel | undefined) ||
  model<EventDocument>("Event", EventSchema);
