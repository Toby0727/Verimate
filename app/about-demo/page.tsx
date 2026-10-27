import { SampleBadge } from "@/components/demo/sample-badge";
import { SimplePage } from "@/components/shell/simple-page";
import { FLOW_STATUS } from "@/lib/demo/flow-status";

export default function AboutDemoPage() {
  return (
    <SimplePage title="About this demo" backHref="/">
      <p className="text-muted-foreground text-sm">
        This is a clickable demo of every Verimate flow. All people, posts,
        scores and notifications are sample data. Your actions are saved only in
        this browser and you can reset them any time from Demo controls.
      </p>
      <ul className="flex flex-col divide-y rounded-xl bg-card">
        {FLOW_STATUS.map((flow) => (
          <li key={flow.name} className="flex items-start gap-3 p-3">
            <div className="flex-1">
              <p className="font-medium text-sm">{flow.name}</p>
              <p className="text-muted-foreground text-xs">{flow.note}</p>
            </div>
            {flow.status === "sample" ? (
              <SampleBadge className="mt-0.5" />
            ) : (
              <span className="rounded-sm bg-verified-tint px-1 font-medium text-[10px] text-verified uppercase">
                Live
              </span>
            )}
          </li>
        ))}
      </ul>
    </SimplePage>
  );
}
