import { Card } from "@/components/ui";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { demoUser } from "@/lib/db";
import type { COUNTRIES } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const u = await demoUser();
  return (
    <div className="max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Profile (demo user)</h1>
      <Card>
        <ProfileForm defaults={{ displayName: u.displayName, username: u.username, bio: u.bio, birthDate: u.birthDate, website: u.website, country: u.country as (typeof COUNTRIES)[number] }} />
      </Card>
    </div>
  );
}
