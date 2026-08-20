import { useCallback, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export type UpdaterStatus = "idle" | "checking" | "available" | "downloading" | "upToDate" | "error";

export interface IUpdaterState {
  status: UpdaterStatus;
  version?: string;
  message?: string;
}

export interface IUseUpdater extends IUpdaterState {
  check: () => Promise<void>;
  installAndRelaunch: () => Promise<void>;
}

const inTauri = (): boolean => typeof window.__TAURI_INTERNALS__ !== "undefined";

export const useUpdater = (): IUseUpdater => {
  const [state, setState] = useState<IUpdaterState>({ status: "idle" });

  const runCheck = useCallback(async () => {
    if (!inTauri()) return;
    setState({ status: "checking" });
    try {
      const update = await check();
      if (update) {
        setState({ status: "available", version: update.version });
      } else {
        setState({ status: "upToDate" });
      }
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
    }
  }, []);

  const installAndRelaunch = useCallback(async () => {
    if (!inTauri()) return;
    setState((current) => ({ status: "downloading", version: current.version }));
    try {
      const update = await check();
      if (!update) {
        setState({ status: "upToDate" });
        return;
      }
      await update.downloadAndInstall();
      await relaunch();
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
    }
  }, []);

  return { ...state, check: runCheck, installAndRelaunch };
};
