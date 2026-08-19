import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCompanyForUser } from "@/lib/jobs";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JobForm } from "./job-form";

export default async function NewJobPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const company = await getCompanyForUser(session.user.id);
  if (!company) {
    redirect("/company");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-8">
        <Card>
          <CardHeader>
            <h1 className="text-lg font-medium">Post a job</h1>
            <p className="text-sm text-muted-foreground">
              Pick the level honestly - it's what keeps entry-level listings actually findable.
            </p>
          </CardHeader>
          <CardContent>
            <JobForm />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
