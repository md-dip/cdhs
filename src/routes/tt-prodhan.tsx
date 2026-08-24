import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { getServerSession } from "@/lib/server-fns/auth";

export const Route = createFileRoute("/tt-prodhan")({
  beforeLoad: async () => {
    const session = await getServerSession();
    if (!session) {
      throw redirect({ to: "/admin-login" });
    }
    return { session };
  },
  head: () => ({
    meta: [
      { title: "অ্যাডমিন প্যানেল | Chhatni Dhekra High School" },
      {
        name: "description",
        content: "ছাতনী ঢেকড়া উচ্চ বিদ্যালয়ের ওয়েবসাইট নিয়ন্ত্রণ প্যানেল।",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { session } = Route.useRouteContext();
  return (
    <AdminShell session={session}>
      <Outlet />
    </AdminShell>
  );
}
