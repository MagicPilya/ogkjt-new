import { Hero } from "@/components/blocks/Hero";
import { NewsGrid } from "@/components/blocks/NewsGrid";
import { Events } from "@/components/blocks/Events";
import { Features } from "@/components/blocks/Features";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
      <NewsGrid />
      <Events />
    </div>
  );
}
