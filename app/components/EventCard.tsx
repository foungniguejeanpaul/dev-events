import Link from "next/link";
import Image from "next/image";

interface Props {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

const EventCard = ({ title, image, slug, location, date, time }: Props) => {
  return (
    <Link
      href={`/events/${slug}`}
      className="block"
      aria-label={`View event ${title}`}
    >
      <article id="event-card">
        <Image
          src={image}
          alt={title}
          width={410}
          height={300}
          className="poster"
          sizes="(max-width: 768px) 100vw, 410px"
        />

        <div className="flex flex-row gap-2 items-center mt-2">
          <Image src="/icons/pin.svg" alt="" width={14} height={14} />
          <p>{location}</p>
        </div>

        <p className="title">{title}</p>

        <div className="datetime">
          <div className="flex flex-row gap-2 items-center">
            <Image src="/icons/calendar.svg" alt="" width={14} height={14} />
            <p>{date}</p>
          </div>

          <div className="flex flex-row gap-2 items-center">
            <Image src="/icons/clock.svg" alt="" width={14} height={14} />
            <p>{time}</p>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default EventCard;
