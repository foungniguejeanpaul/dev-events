import EventCard from "./components/EventCard";
import { cacheLife } from "next/cache";
import { events } from "@/lib/constants";

const FeaturedEvents = async () => {
  'use cache';
  cacheLife('seconds');

  // PLUS TARD tu pourras remettre le fetch ici 👇
  // const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, {
  //   next: { revalidate: 60 }
  // });
  // const { events } = await response.json();

  return (
    <ul className="events">
      {events.map((event) => (
        <li className="list-none" key={event.title}>
          <EventCard {...event} />
        </li>
      ))}
    </ul>
  );
};

export default FeaturedEvents;
