import { MeetingList } from "@/components/meeting-list";

export const metadata = {
  title: "Spry — Meeting Analytics",
  description: "Meeting analytics and calendar intelligence",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-black">
      <MeetingList />
    </main>
  );
}
