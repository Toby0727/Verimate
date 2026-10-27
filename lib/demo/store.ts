// Sample data — delete when the flows are replaced with real functionality.
// The sample world lives only in this browser's localStorage.
import { createSeedWorld, DEMO_VERSION } from "./seed";
import type { DemoWorld } from "./types";

export const STORAGE_KEY = "verimate-demo-v1";

let world: DemoWorld | null = null;
const listeners = new Set<() => void>();

function load(): DemoWorld {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoWorld;
      if (parsed.version === DEMO_VERSION) return parsed;
    }
  } catch {
    // Unreadable or unavailable storage: fall back to a fresh seed.
  }
  return createSeedWorld(new Date());
}

function persist(next: DemoWorld) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: the demo keeps working for this session.
  }
}

export function getSnapshot(): DemoWorld {
  if (!world) {
    world = load();
    persist(world);
  }
  return world;
}

export function getServerSnapshot(): DemoWorld | null {
  return null;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setWorld(updater: (current: DemoWorld) => DemoWorld) {
  world = updater(getSnapshot());
  persist(world);
  for (const listener of listeners) listener();
}

export function resetWorld() {
  setWorld(() => createSeedWorld(new Date()));
}
