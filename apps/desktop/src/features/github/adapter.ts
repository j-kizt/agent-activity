import { invoke } from "@tauri-apps/api/core";
import type {
  IDeviceCodeStart,
  IDevicePollResult,
  IGhAccount,
  IGithubRepoStatus,
} from "./types";

const TRACKED_REPOS_KEY = "agent-activity.github.tracked-repos";
const STATUS_CACHE_KEY = "agent-activity.github.status-cache";

const REPO_PATTERN = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;

export const isValidRepo = (repo: string): boolean => REPO_PATTERN.test(repo.trim());

export const fetchRepoStatus = (repo: string): Promise<IGithubRepoStatus> =>
  invoke<IGithubRepoStatus>("github_repo_status", { repo });

export const fetchAvailableRepos = (): Promise<string[]> =>
  invoke<string[]>("github_available_repos");

export const fetchAccounts = (): Promise<IGhAccount[]> =>
  invoke<IGhAccount[]>("github_accounts");

export const switchAccount = (user: string): Promise<string> =>
  invoke<string>("github_switch_account", { user });

export const deviceStart = (): Promise<IDeviceCodeStart> =>
  invoke<IDeviceCodeStart>("github_device_start");

export const devicePoll = (deviceCode: string): Promise<IDevicePollResult> =>
  invoke<IDevicePollResult>("github_device_poll", { deviceCode });

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — the in-memory state still holds */
  }
};

export const readTrackedRepos = (): string[] => {
  const value = readJson<unknown>(TRACKED_REPOS_KEY, []);
  return Array.isArray(value) ? value.filter((r): r is string => typeof r === "string" && isValidRepo(r)) : [];
};

export const writeTrackedRepos = (repos: string[]): void => writeJson(TRACKED_REPOS_KEY, repos);

export const readStatusCache = (): Record<string, IGithubRepoStatus> =>
  readJson<Record<string, IGithubRepoStatus>>(STATUS_CACHE_KEY, {});

export const writeStatusCache = (cache: Record<string, IGithubRepoStatus>): void =>
  writeJson(STATUS_CACHE_KEY, cache);
