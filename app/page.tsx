import { redirect } from "next/navigation";
import { getAuthSession } from "@/libs/auth";
import { getDefaultDashboardByRole } from "@/utils/safe-return";

export const dynamic = "force-dynamic";

export default async function RootRedirectPage(): Promise<never> {
  const session = await getAuthSession();

  if (session?.user && session.error !== "RefreshAccessTokenError") {
    redirect(getDefaultDashboardByRole(session.user.role));
  }

  redirect("/sso/login");
}
