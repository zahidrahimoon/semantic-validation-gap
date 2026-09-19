import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { BookingForm } from "@/components/forms/BookingForm";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { getCourse } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCourse(id);
  if (!c) notFound();
  const remaining = c.capacity - c.seatsBooked;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <div className="mb-2 flex flex-wrap gap-2"><Badge>{c.category}</Badge><Badge>{c.level}</Badge>{c.tags.split(",").filter(Boolean).map((t) => <Badge key={t}>#{t}</Badge>)}</div>
        <h1 className="text-2xl font-bold">{c.title}</h1>
        <p className="my-3 whitespace-pre-line text-sm leading-6">{c.description}</p>
        <dl className="grid grid-cols-2 gap-y-1 text-sm">
          <dt>Price</dt><dd className="font-mono">${c.price}{c.discountPercent ? ` (−${c.discountPercent}%)` : ""}</dd>
          <dt>Location</dt><dd>{c.location}</dd>
          <dt>Starts</dt><dd className="font-mono">{c.startsAt.toISOString()}</dd>
          <dt>Ends</dt><dd className="font-mono">{c.endsAt.toISOString()}</dd>
          <dt>Capacity</dt><dd className="font-mono">{c.seatsBooked} / {c.capacity} booked</dd>
        </dl>
        <Card title={`Reviews (${c.reviews.length})`} className="mt-6">
          {c.reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
          {c.reviews.map((r) => (
            <div key={r.id} className="mb-3 border-b border-muted pb-2 text-sm">
              <p className="font-mono">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} <strong>{r.title}</strong> — {r.user.displayName}</p>
              <p className="whitespace-pre-line">{r.body}</p>
            </div>
          ))}
          <ReviewForm courseId={c.id} />
        </Card>
      </div>
      <Card title="Book this workshop">
        <BookingForm courseId={c.id} remaining={remaining} />
      </Card>
    </div>
  );
}
