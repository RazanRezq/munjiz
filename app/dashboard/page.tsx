import { UserButton, useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard (Test Area)</h1>
      <p>If you see this, you are logged in!</p>

      {/* Clerk component to show user avatar and sign out */}
      <div className="mt-4">
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </div>
  );
}
