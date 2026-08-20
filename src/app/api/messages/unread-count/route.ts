import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUnreadMessageCount } from "@/lib/messages";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const count = await getUnreadMessageCount(session.user.id);
  return NextResponse.json({ count });
}
