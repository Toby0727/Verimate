"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { OptionalProfileFields } from "@/components/profile/optional-profile-fields";
import { RequiredProfileForm } from "@/components/profile/required-profile-form";
import { AccessGate } from "@/components/shell/access-gate";
import { useDemo } from "@/lib/demo/use-demo";

function EditProfileContent() {
  const demo = useDemo();
  const router = useRouter();
  if (!demo) return <DemoSkeleton />;

  return (
    <div className="p-4">
      <RequiredProfileForm
        initial={demo.profile}
        submitLabel="Save profile"
        extra={(values, set) => (
          <OptionalProfileFields
            values={values}
            set={set}
            buildings={demo.world.buildings}
          />
        )}
        onSaved={() => {
          toast.success("Profile saved.");
          router.push("/me");
        }}
      />
    </div>
  );
}

export function EditProfile() {
  return (
    <AccessGate require="signed-in">
      <EditProfileContent />
    </AccessGate>
  );
}
