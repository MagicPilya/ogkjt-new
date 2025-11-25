import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="container py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground mb-8">Раздел находится в разработке.</p>
      <Button asChild>
        <Link href="/">На главную</Link>
      </Button>
    </div>
  );
}

