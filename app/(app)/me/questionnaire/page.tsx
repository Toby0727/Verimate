import { QuestionnaireForm } from "@/components/profile/questionnaire-form";
import { PageHeader } from "@/components/shell/page-header";

export default function QuestionnairePage() {
  return (
    <>
      <PageHeader title="Detailed questionnaire" backHref="/me" />
      <QuestionnaireForm />
    </>
  );
}
