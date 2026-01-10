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
  validator: (value: string): boolean => typeof value === "string" && value.trim().length > 0,
  message: "Field is required and cannot be empty.",
};

/**
 * Generates a URL-friendly slug from a title.
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace to dashes
    .replace(/-+/g, "-") // collapse multiple dashes
    .replace(/^-|-$/g, ""); // trim leading/trailing dash
}

/**
 * Normalize a date string to YYYY-MM-DD (ISO date without time).
 * Throws if the date is invalid.
 */
function normalizeDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid event date provided.");
  }
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Normalize time to HH:mm (24-hour) format.
 * Accepts common time formats and throws on invalid input.
 */
function normalizeTime(timeStr: string): string {
  const trimmed = timeStr.trim();

  // Already in HH:mm and valid.
  const hhmmMatch = /^(\d{2}):(\d{2})$/.exec(trimmed);
  if (hhmmMatch) {
    const hours = Number(hhmmMatch[1]);
    const minutes = Number(hhmmMatch[2]);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${hhmmMatch[1]}:${hhmmMatch[2]}`;
    }
  }

  // Simple 12h format with am/pm, e.g. "6:30 pm", "06:30 AM".
  const ampmMatch = /^(\d{1,2}):(\d{2})\s*([ap]m)$/i.exec(trimmed);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = Number(ampmMatch[2]);
    const period = ampmMatch[3].toLowerCase();

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      throw new Error("Invalid event time provided.");
    }

    if (period === "pm" && hours !== 12) {
      hours += 12;
    }
    if (period === "am" && hours === 12) {
      hours = 0;
    }

    const hh = hours.toString().padStart(2, "0");
    const mm = minutes.toString().padStart(2, "0");
    return `${hh}:${mm}`;
  }

  throw new Error("Event time must be in HH:mm or h:mm am/pm format.");
}

const EventSchema = new Schema<EventDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      validate: nonEmptyString,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      validate: nonEmptyString,
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required."],
      validate: nonEmptyString,
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required."],
      validate: nonEmptyString,
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required."],
      validate: nonEmptyString,
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required."],
      validate: nonEmptyString,
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required."],
      validate: nonEmptyString,
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Time is required."],
      validate: nonEmptyString,
      trim: true,
    },
    mode: {
      type: String,
      required: [true, "Mode is required."],
      validate: nonEmptyString,
      trim: true,
    },
    audience: {
      type: String,
      required: [true, "Audience is required."],
      validate: nonEmptyString,
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required."],
      validate: {
        validator: (value: string[]): boolean =>
          Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string" && v.trim().length > 0),
        message: "Agenda must be a non-empty array of non-empty strings.",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required."],
      validate: nonEmptyString,
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required."],
      validate: {
        validator: (value: string[]): boolean =>
          Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string" && v.trim().length > 0),
        message: "Tags must be a non-empty array of non-empty strings.",
      },
    },
  },
  {
    timestamps: true, // automatically manages createdAt and updatedAt
  }
);

/**
 * Pre-save hook: generate slug when creating/updating and normalize date/time.
 * - Slug is only regenerated if the title has been modified.
 * - Date is normalized to YYYY-MM-DD.
 * - Time is normalized to HH:mm.
 */
EventSchema.pre("save", function (next) {
  if (this.isModified("title")) {
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

// Ensure unique index on slug at the schema level.
EventSchema.index({ slug: 1 }, { unique: true });

export type EventModel = Model<EventDocument>;

export const Event: EventModel =
  (models.Event as EventModel | undefined) || model<EventDocument>("Event", EventSchema);
