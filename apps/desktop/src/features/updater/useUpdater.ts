import { useCallback, useEffect, useRef, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { getVersion } from "@tauri-apps/api/app";

type Update = Awaited<ReturnType<typeof check>>;

export type UpdaterStatus = "idle" | "checking" | "available" | "downloading" | "upToDate" | "error";

export interface IUpdaterState {
  status: UpdaterStatus;
  version?: string;
  notes?: string;
  date?: string;
  message?: string;
}

export interface IUseUpdater extends IUpdaterState {
  currentVersion: string | null;
  check: () => Promise<void>;
  installAndRelaunch: () => Promise<void>;
}

const inTauri = (): boolean => typeof window.__TAURI_INTERNALS__ !== "undefined";

export const useUpdater = (): IUseUpdater => {
  const [state, setState] = useState<IUpdaterState>({ status: "idle" });
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const pendingUpdateRef = useRef<Update>(null);

  useEffect(() => {
    if (!inTauri()) return;
    getVersion().then(setCurrentVersion).catch(() => setCurrentVersion(null));
  }, []);

  const runCheck = useCallback(async () => {
    if (!inTauri()) return;
    setState({ status: "checking" });
    try {
      const update = await check();
      pendingUpdateRef.current = update;
      if (update) {
        setState({ status: "available", version: update.version, notes: update.body, date: update.date });
      } else {
        setState({ status: "upToDate" });
      }
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
    }
  }, []);

  const installAndRelaunch = useCallback(async () => {
    if (!inTauri()) return;
    const update = pendingUpdateRef.current;
    if (!update) {
      setState({ status: "upToDate" });
      return;
    }
    setState((current) => ({ ...current, status: "downloading" }));
    try {
      await update.downloadAndInstall();
      await relaunch();
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
    }
  }, []);

  return { ...state, currentVersion, check: runCheck, installAndRelaunch };
};
