import Link from "next/link";
import { Badge, Button, Card, Input, Notice, Select } from "@/components/ui";
import { searchCourses } from "@/lib/services";
import { COURSE_CATEGORIES, SORT_OPTIONS } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function CoursesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const { query, errors, items, total, pageSize } = await searchCourses(params);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Courses</h1>
      <Card className="mb-6">
        <form method="get" className="grid gap-3 sm:grid-cols-6">
          <Input name="q" placeholder="Search" defaultValue={query.q ?? ""} className="sm:col-span-2" />
          <Select name="category" defaultValue={query.category ?? ""}>
            <option value="">Any category</option>
            {COURSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Input name="minPrice" type="number" placeholder="Min $" defaultValue={query.minPrice ?? ""} />
          <Input name="maxPrice" type="number" placeholder="Max $" defaultValue={query.maxPrice ?? ""} />
          <Select name="sort" defaultValue={query.sort}>{SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}</Select>
          <Button type="submit" className="sm:col-span-6">Apply</Button>
        </form>
        {errors && <Notice kind="error">Some filters were invalid and ignored: {Object.keys(errors).join(", ")}</Notice>}
      </Card>
      <p className="mb-3 text-sm text-muted-foreground">{total} result(s), page {query.page} of {pages}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((c) => (
          <Link key={c.id} href={`/courses/${c.id}`} className="block border border-black p-4 hover:bg-black hover:text-white">
            <div className="mb-1 flex flex-wrap gap-2"><Badge>{c.category}</Badge><Badge>{c.level}</Badge></div>
            <h2 className="text-lg font-bold">{c.title}</h2>
            <p className="line-clamp-2 text-sm">{c.description}</p>
            <p className="mt-2 font-mono text-sm">${c.price}{c.discountPercent ? ` (−${c.discountPercent}%)` : ""} · {c.location} · {c.startsAt.toISOString().slice(0, 16).replace("T", " ")}</p>
          </Link>
        ))}
      </div>
      {pages > 1 && (
        <div className="mt-4 flex gap-2 text-sm">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={{ pathname: "/courses", query: { ...params, page: String(p) } }} className={p === query.page ? "border border-black bg-black px-2 text-white" : "border border-black px-2"}>{p}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
