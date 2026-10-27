import {
  BadgeCheck,
  Camera,
  Home as HomeIcon,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified students",
    description: "Every lister is checked against a university email.",
  },
  {
    icon: Camera,
    title: "Real photos",
    description: "Listing photos are checked for provenance.",
  },
  {
    icon: HomeIcon,
    title: "Simple subleases",
    description: "Pick dates, message, and move in.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-24">
      <div className="flex flex-col gap-4">
        <Badge variant="secondary" className="w-fit">
          <BadgeCheck />
          Coming soon
        </Badge>
        <h1 className="font-semibold text-4xl tracking-tight">Verimate</h1>
        <p className="text-lg text-muted-foreground">
          Verified student subleasing for Syracuse University and SUNY ESF.
        </p>
        <div className="flex gap-3">
          <Button>Browse listings</Button>
          <Button variant="outline">List your room</Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="size-5 text-primary" />
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </main>
  );
}
