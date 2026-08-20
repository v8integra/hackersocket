import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";
import { ExperienceSection } from "./experience-section";
import { EducationSection } from "./education-section";
import { DeleteAccountSection } from "./delete-account-section";

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, company] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        experiences: { orderBy: { startDate: "desc" } },
        educations: { orderBy: { startDate: "desc" } },
      },
    }),
    prisma.company.findUnique({ where: { ownerId: session.user.id }, select: { id: true } }),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
        <Card>
          <CardHeader>
            <h1 className="text-lg font-medium">Edit profile</h1>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initial={{
                username: user.username ?? "",
                name: user.name ?? "",
                headline: user.headline ?? "",
                bio: user.bio ?? "",
                location: user.location ?? "",
                githubUsername: user.githubUsername ?? "",
                linkedinUrl: user.linkedinUrl ?? "",
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-medium">Experience</h2>
          </CardHeader>
          <CardContent>
            <ExperienceSection experiences={user.experiences} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-medium">Education</h2>
          </CardHeader>
          <CardContent>
            <EducationSection educations={user.educations} />
          </CardContent>
        </Card>

        <DeleteAccountSection
          username={user.username ?? user.email}
          ownsCompany={!!company}
        />
      </main>
    </>
  );
}
