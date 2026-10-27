export default function OnboardingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-background shadow-sm">
      {children}
    </div>
  );
}
