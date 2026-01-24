import { EventDocument } from '@/database';
import EventCard from './components/EventCard';
import ExploreBtn from './components/ExploreBtn';
import { cacheLife } from 'next/cache';

import { events } from '@/lib/constants';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const page = async () => {
    'use cache';
    cacheLife('seconds');
    // const response = await fetch(`${BASE_URL}/api/events`, {
    //     next: { revalidate: 60 }
    // });

    // const { events } = await response.json();

    return (
        <section>
            <h1 className="text-center">
                The Hub for every Dev <br />Event You Cant Mss
            </h1>
            <p className="text-center mt-5">Hackatons, Meetups, Conferences, All in One place </p>
            <ExploreBtn />
            <div className='mt-20 space-y-7'>
                <h3>Featured Events</h3>
                <ul className="events">
                    {events && events.length > 0 && events.map((event: EventDocument) => (
                        <li className='list-none' key={event.title}>
                            <EventCard {...event} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export default page