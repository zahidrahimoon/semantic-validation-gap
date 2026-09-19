import { Card } from "@/components/ui";
import { CourseForm } from "@/components/forms/CourseForm";

export default function NewCoursePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Admin · New course</h1>
      <Card><CourseForm /></Card>
    </div>
  );
}
