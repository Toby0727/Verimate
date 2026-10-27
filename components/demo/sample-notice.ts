import { toast } from "sonner";

// Tells the viewer that a real-world side effect did not actually happen.
export function showSampleNotice(message: string) {
  toast.info(`Sample: ${message}`);
}
