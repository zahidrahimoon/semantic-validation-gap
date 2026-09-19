import { Card, LinkButton } from "@/components/ui";
import { db } from "@/lib/db";
import { ollamaHealth, OLLAMA_MODEL } from "@/lib/ollama";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [courses, bookings, tickets] = await Promise.all([db.course.count(), db.booking.count(), db.ticket.count()]);
  const ollama = await ollamaHealth();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="What this app is">
        <p className="text-sm leading-6">
          <strong>mono</strong> is a small workshop-booking platform used as a research testbed. Every form is
          validated with Zod (structural rules: type, length, regex, range, enum, format). A few business rules are
          enforced in code; many are deliberately not. The research question is which structurally valid inputs slip
          through into business logic, the database and the AI assistant.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href="/courses">Browse courses</LinkButton>
          <LinkButton href="/support">Open a ticket</LinkButton>
          <LinkButton href="/assistant">Ask the assistant</LinkButton>
        </div>
      </Card>
      <Card title="Status">
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt>Courses</dt><dd className="font-mono">{courses}</dd>
          <dt>Bookings</dt><dd className="font-mono">{bookings}</dd>
          <dt>Tickets</dt><dd className="font-mono">{tickets}</dd>
          <dt>Ollama</dt><dd className="font-mono">{ollama.up ? "UP" : "DOWN"}</dd>
          <dt>Configured model</dt><dd className="font-mono">{OLLAMA_MODEL}</dd>
          <dt>Pulled models</dt><dd className="font-mono">{ollama.models.join(", ") || "—"}</dd>
        </dl>
      </Card>
      <Card title="Input surfaces (for the study)" className="md:col-span-2">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-black text-left"><th className="py-1">Surface</th><th>Fields</th><th>AI-facing</th><th>HTTP path</th></tr></thead>
          <tbody className="[&_td]:py-1 [&_td]:pr-3 [&_tr]:border-b [&_tr]:border-muted">
            <tr><td>Profile</td><td>displayName, username, bio, birthDate, website, country</td><td>bio (assistant context)</td><td>PUT /api/profile</td></tr>
            <tr><td>Course (admin)</td><td>title, description, category, level, location, price, discountPercent, capacity, startsAt, endsAt, tags[]</td><td>—</td><td>POST /api/courses</td></tr>
            <tr><td>Search</td><td>q, category, minPrice, maxPrice, sort, page</td><td>—</td><td>GET /api/courses</td></tr>
            <tr><td>Booking</td><td>courseId, seats, attendeeName, attendeeEmail, promoCode, notes</td><td>—</td><td>POST /api/bookings</td></tr>
            <tr><td>Review</td><td>courseId, rating, title, body</td><td>—</td><td>POST /api/reviews</td></tr>
            <tr><td>Support ticket</td><td>subject, description, priority, category, bookingRef</td><td>subject + description (triage)</td><td>POST /api/tickets</td></tr>
            <tr><td>Assistant chat</td><td>message</td><td>message</td><td>POST /api/chat</td></tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
