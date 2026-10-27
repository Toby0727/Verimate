import { EditProfile } from "@/components/me/edit-profile";
import { PageHeader } from "@/components/shell/page-header";

export default function EditProfilePage() {
  return (
    <>
      <PageHeader title="Edit profile" backHref="/me" />
      <EditProfile />
    </>
  );
}
