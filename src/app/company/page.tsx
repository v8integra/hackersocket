import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getCompanyForUser } from "@/lib/jobs";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyForm } from "./company-form";
import { CompanyJobRow } from "./company-job-row";

export default async function CompanyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const company = await getCompanyForUser(session.user.id);

  if (!company) {
    return (
      <>
        <Navbar />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-8">
          <Card>
            <CardHeader>
              <h1 className="text-lg font-medium">Create your company</h1>
              <p className="text-sm text-muted-foreground">
                Set up a company profile so you can post jobs, sorted into the right tier.
              </p>
            </CardHeader>
            <CardContent>
              <CompanyForm />
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-8">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <h1 className="text-lg font-medium">{company.name}</h1>
              {company.website && (
                <p className="text-xs text-muted-foreground">{company.website}</p>
              )}
            </div>
            <Button
              size="sm"
              className="bg-brand text-brand-foreground hover:bg-brand-hover"
              nativeButton={false}
              render={<Link href="/company/jobs/new">Post a job</Link>}
            />
          </CardHeader>
        </Card>

        <div className="flex flex-col gap-3">
          {company.jobPostings.length === 0 && (
            <p className="text-sm text-muted-foreground">No job postings yet.</p>
          )}
          {company.jobPostings.map((job) => (
            <CompanyJobRow key={job.id} job={job} />
          ))}
        </div>
      </main>
    </>
  );
}
