import { Settings } from "@/components/me/settings";
import { PageHeader } from "@/components/shell/page-header";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings & privacy" backHref="/me" />
      <Settings />
    </>
  );
}
