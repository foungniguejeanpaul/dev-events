import { notFound } from "next/navigation";
import Image from "next/image";

const EventDetailsItem = ({ icon, alt, label }: { icon: string, alt: string, label: string }) => (
    <div>
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailsPaage = async ({ params }: { params: Promise<{ slug: string }> }) => {

    const { slug } = await params;

    const response = await fetch(`${BASE_URL}/api/events/${slug}`, {
        next: { revalidate: 10 }
    });

    const data = await response.json();
    console.log('event details from backend', data);

    if (!data) return notFound();

    return (
        <section id="event">
            <div className="header">
                <h1>Event description</h1>
                <p className="mt-2">{data.description}</p>
            </div>
            <div className="details">
                {/* Left side - Event details */}
                <div className="content">
                    <Image src={data.image} alt={data.slug} width={800} height={800} />

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{data.overview}</p>
                    </section>
                    <section className="flex-col-gap-2">
                        <h2>Event details</h2>
                        <EventDetailsItem icon="/icons/calendar.svg" alt="calendar" label={data.date} />
                    </section>
                </div>

                {/* Right side - booking form */}
                <aside className="booking">
                    <p className="text-lg font-semibold">Book Event</p>
                </aside>
            </div>
        </section>
    )
}

export default EventDetailsPaage