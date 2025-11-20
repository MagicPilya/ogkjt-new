import { Hero } from "@/components/blocks/Hero";
import { NewsGrid } from "@/components/blocks/NewsGrid";
import { QuickLinks } from "@/components/blocks/QuickLinks";
import { Events } from "@/components/blocks/Events";
import { FeedbackForm } from "@/components/blocks/FeedbackForm";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <QuickLinks />
      <NewsGrid />
      <Events />
      <FeedbackForm />
    </div>
  );
}
