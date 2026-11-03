import type { Metadata } from "next";
import { WaitlistPage } from "@/components/waitlist/waitlist-page";

export const metadata: Metadata = {
  title: "Verimate · Join the waitlist",
  description:
    "Roommates and sublets with verified SU & ESF students. Join the waitlist for a chance to win a $50 Amazon gift card.",
};

export default function Home() {
  return <WaitlistPage />;
}
