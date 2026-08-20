import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ArrowRight, Check, Coffee, Download, Focus, Monitor as MonitorIcon, PlugZap, Puzzle, RefreshCw } from "lucide-react";
import type { IAgentActivityBridgeCapabilities } from "@agent-activity/protocol";
import { shortenPath } from "../session/activity";
import { displayResolutionLabel, type IDisplayStateSnapshot } from "./display";
import type { IUseUpdater } from "../updater/useUpdater";

type SetupCategory = "connection" | "plugins" | "display" | "update";
const SETUP_CATEGORIES: SetupCategory[] = ["connection", "display", "plugins", "update"];

export interface ISetupPanelProps {
  capabilities: IAgentActivityBridgeCapabilities;
  canUseNativeControls: boolean;
  connectionTitle: string;
  guidance: { title: string; detail: string };
  isConnected: boolean;
  keepAwakeActive: boolean;
  keepAwakeEnabled: boolean;
  keepAwakeError: string | null;
  displayError: string | null;
  displayLoading: boolean;
  displayState: IDisplayStateSnapshot | null;
  hookStatus: { path: string | null; installed: boolean | null };
  nativeAction: { bridgeOnline: boolean | null; message: string | null };
  onCheckBridge: () => void;
  onInstallHook: () => void;
  onDisplayChange: (displayId: string) => Promise<void>;
  onDisplayRefresh: () => Promise<void>;
  onKeepAwakeChange: (enabled: boolean) => void;
  terminal: "iterm" | "ghostty";
  onTerminalChange: (choice: "iterm" | "ghostty") => void;
  updater: IUseUpdater;
}

const UPDATER_DETAIL: Record<IUseUpdater["status"], string> = {
  idle: "Check for the latest release",
  checking: "Checking for updates…",
  available: "Update available",
  downloading: "Downloading update…",
  upToDate: "You're on the latest version",
  error: "Update check failed",
};

export const SetupPanel = ({ capabilities, canUseNativeControls, connectionTitle, displayError, displayLoading, displayState, guidance, isConnected, keepAwakeActive, keepAwakeEnabled, keepAwakeError, hookStatus, nativeAction, onCheckBridge, onDisplayChange, onDisplayRefresh, onInstallHook, onKeepAwakeChange, terminal, onTerminalChange, updater }: ISetupPanelProps) => {
  const [activeCategory, setActiveCategory] = useState<SetupCategory>("connection");
  const [compactNavigation, setCompactNavigation] = useState(() => window.matchMedia("(max-width: 380px)").matches);
  const [displayPickerOpen, setDisplayPickerOpen] = useState(false);
  const displayPickerTriggerRef = useRef<HTMLButtonElement | null>(null);
  const displayInteractionBusyRef = useRef(false);
  const displays = displayState?.displays ?? [];
  const activeDisplay = displays.find((display) => display.id === displayState?.activeDisplayId) ?? null;
  const displayRadioSelection = displayState?.selectedDisplayId ?? null;
  const displayFocusTarget = displayRadioSelection ?? displayState?.activeDisplayId ?? null;

  const closeDisplayPicker = (): void => {
    setDisplayPickerOpen(false);
    window.requestAnimationFrame(() => displayPickerTriggerRef.current?.focus());
  };

  const handleDisplayKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, currentIndex: number): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeDisplayPicker();
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key) || displays.length === 0 || displayInteractionBusyRef.current || displayLoading) return;
    event.preventDefault();
    event.stopPropagation();
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? displays.length - 1
        : (currentIndex + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + displays.length) % displays.length;
    const nextDisplay = displays[nextIndex];
    if (!nextDisplay) return;
    displayInteractionBusyRef.current = true;
    void onDisplayChange(nextDisplay.id).finally(() => {
      displayInteractionBusyRef.current = false;
    });
    window.requestAnimationFrame(() => document.getElementById(`display-option-${nextIndex}`)?.focus());
  };

  const selectCategory = (category: SetupCategory): void => {
    setDisplayPickerOpen(false);
    setActiveCategory(category);
  };

  const handleCategoryKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, current: SetupCategory): void => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = SETUP_CATEGORIES.indexOf(current);
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? SETUP_CATEGORIES.length - 1 : (currentIndex + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + SETUP_CATEGORIES.length) % SETUP_CATEGORIES.length;
    const next = SETUP_CATEGORIES[nextIndex] ?? "connection";
    selectCategory(next);
    window.requestAnimationFrame(() => document.getElementById(`setup-tab-${next}`)?.focus());
  };

  const handleSetupKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== "Escape") return;
    if (displayPickerOpen) {
      event.preventDefault();
      event.stopPropagation();
      closeDisplayPicker();
    }
  };

  useEffect(() => {
    if (!displayPickerOpen || displayLoading) return;
    const selectedIndex = Math.max(0, displays.findIndex((display) => display.id === displayFocusTarget));
    window.requestAnimationFrame(() => document.getElementById(`display-option-${selectedIndex}`)?.focus());
  }, [displayPickerOpen, displayFocusTarget, displayLoading, displays.length]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 380px)");
    const update = () => setCompactNavigation(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div className="setup-body" onKeyDown={handleSetupKeyDown}>
      <div className="setup-layout">
        <div className="setup-sidebar" role="tablist" aria-label="Setup sections" aria-orientation={compactNavigation ? "horizontal" : "vertical"}>
          <button className="setup-side-tab" id="setup-tab-connection" type="button" role="tab" aria-selected={activeCategory === "connection"} aria-controls="setup-panel-connection" tabIndex={activeCategory === "connection" ? 0 : -1} data-active={activeCategory === "connection"} onClick={() => selectCategory("connection")} onKeyDown={(event) => handleCategoryKeyDown(event, "connection")}><PlugZap size={12} strokeWidth={2.2} /><span>Connection</span></button>
          <button className="setup-side-tab" id="setup-tab-display" type="button" role="tab" aria-selected={activeCategory === "display"} aria-controls="setup-panel-display" tabIndex={activeCategory === "display" ? 0 : -1} data-active={activeCategory === "display"} onClick={() => selectCategory("display")} onKeyDown={(event) => handleCategoryKeyDown(event, "display")}><MonitorIcon size={12} strokeWidth={2.2} /><span>Display</span></button>
          <button className="setup-side-tab" id="setup-tab-plugins" type="button" role="tab" aria-selected={activeCategory === "plugins"} aria-controls="setup-panel-plugins" tabIndex={activeCategory === "plugins" ? 0 : -1} data-active={activeCategory === "plugins"} onClick={() => selectCategory("plugins")} onKeyDown={(event) => handleCategoryKeyDown(event, "plugins")}><Puzzle size={12} strokeWidth={2.2} /><span>Plugins</span></button>
          <button className="setup-side-tab" id="setup-tab-update" type="button" role="tab" aria-selected={activeCategory === "update"} aria-controls="setup-panel-update" tabIndex={activeCategory === "update" ? 0 : -1} data-active={activeCategory === "update"} onClick={() => selectCategory("update")} onKeyDown={(event) => handleCategoryKeyDown(event, "update")}><Download size={12} strokeWidth={2.2} /><span>Update</span></button>
        </div>

        <div className="setup-category-panel" id={`setup-panel-${activeCategory}`} role="tabpanel" aria-labelledby={`setup-tab-${activeCategory}`}>
          {activeCategory === "connection" ? (
            <>
              <div className="setup-section-heading"><span>Connection</span><small>Bridge and agent integration</small></div>
              <div className="setup-row"><span className="bridge-dot" data-connected={isConnected} title={connectionTitle} /><span className="setup-copy"><span className="setup-title">Bridge</span><span className="setup-detail">{connectionTitle}</span></span>{!isConnected ? <button className="pill-btn" type="button" onClick={onCheckBridge} data-tauri-drag-region="false" aria-label="Reconnect bridge"><PlugZap size={12} strokeWidth={2.3} />Reconnect</button> : null}</div>
              <div className="setup-row passive"><span className="status-slot"><ArrowRight className="setup-icon" size={14} strokeWidth={2.3} /></span><span className="setup-copy"><span className="setup-title">{guidance.title}</span><span className="setup-detail">{guidance.detail}</span></span></div>
              <div className="setup-row"><span className="status-slot"><Focus className="setup-icon" size={14} strokeWidth={2.3} /></span><span className="setup-copy"><span className="setup-title">Terminal</span><span className="setup-detail">Focus jumps to this terminal at the session cwd</span></span><span className="setup-segment" role="group" aria-label="Focus terminal">{([["iterm", "iTerm2"], ["ghostty", "Ghostty"]] as const).map(([value, label]) => <button key={value} type="button" className="setup-segment-option" data-active={terminal === value} aria-pressed={terminal === value} onClick={() => onTerminalChange(value)} data-tauri-drag-region="false">{label}</button>)}</span></div>
              {nativeAction.message ? <div className="notice-row" data-online={nativeAction.bridgeOnline === true} role="status" aria-live="polite">{nativeAction.message}</div> : null}
            </>
          ) : null}

          {activeCategory === "plugins" ? (
            <>
              <div className="setup-section-heading"><span>Plugins</span><small>Agent integrations</small></div>
              <div className="setup-row"><span className="status-slot"><Download className="setup-icon" size={14} strokeWidth={2.3} /></span><span className="setup-copy"><span className="setup-title">Claude Code hooks</span><span className="setup-detail">{hookStatus.installed === true ? `Installed · ${shortenPath(hookStatus.path)}` : hookStatus.installed === false ? `Not installed · ${shortenPath(hookStatus.path)}` : canUseNativeControls ? "Checking install state" : "Tauri runtime needed"}</span></span>{hookStatus.installed ? (<span className="setup-installed"><Check size={12} strokeWidth={2.6} />Installed</span>) : (<button className="pill-btn accent" type="button" onClick={onInstallHook} data-tauri-drag-region="false"><Download size={12} strokeWidth={2.3} />Install</button>)}</div>
            </>
          ) : null}

          {activeCategory === "display" ? (
            <>
              <div className="setup-section-heading"><span>Display</span><small>Screen placement and power behavior</small></div>
              <div className="setup-row display-setting-row"><span className="status-slot"><MonitorIcon className="setup-icon" size={14} strokeWidth={2.2} /></span><span className="setup-copy"><span className="setup-title">Target display</span><span className="setup-detail">{!canUseNativeControls ? "Desktop runtime required" : displayLoading ? "Reading connected displays" : displayError ? displayError : displayState?.fallbackActive ? `${displayState.preferredDisplayName || "Saved display"} unavailable · using ${activeDisplay?.name ?? "Primary"}` : activeDisplay ? `${activeDisplay.name} · ${displayResolutionLabel(activeDisplay)}${activeDisplay.isPrimary ? " · Primary" : ""}` : "No connected display found"}</span></span><button ref={displayPickerTriggerRef} className="pill-btn" type="button" disabled={!canUseNativeControls || displays.length === 0} aria-busy={displayLoading} onClick={() => { if (displayPickerOpen) closeDisplayPicker(); else { setDisplayPickerOpen(true); void onDisplayRefresh(); } }} data-tauri-drag-region="false" aria-controls="display-picker" aria-expanded={displayPickerOpen}><MonitorIcon size={12} strokeWidth={2.2} />{displayPickerOpen ? "Close" : "Choose"}</button></div>
              {displayPickerOpen ? (
                <div className="display-picker" id="display-picker" role="radiogroup" aria-label="Display" aria-busy={displayLoading}>{displays.map((display, index) => <button className="display-option" data-selected={display.id === displayRadioSelection} disabled={displayLoading} id={`display-option-${index}`} type="button" role="radio" aria-checked={display.id === displayRadioSelection} tabIndex={display.id === displayFocusTarget ? 0 : -1} onClick={() => { if (displayInteractionBusyRef.current) return; displayInteractionBusyRef.current = true; void onDisplayChange(display.id).finally(() => { displayInteractionBusyRef.current = false; }); closeDisplayPicker(); }} onKeyDown={(event) => handleDisplayKeyDown(event, index)} data-tauri-drag-region="false" key={display.id}><MonitorIcon size={16} strokeWidth={2.1} aria-hidden="true" /><span className="display-option-copy"><span>{display.name}</span><small>{displayResolutionLabel(display)}{display.isPrimary ? " · Primary" : ""}</small></span><span className="display-option-mark" aria-hidden="true">{display.id === displayRadioSelection ? "✓" : ""}</span></button>)}</div>
              ) : null}
              <div className="setup-row"><span className="status-slot"><Coffee className="setup-icon" size={14} strokeWidth={2.3} /></span><span className="setup-copy"><span className="setup-title">Keep display awake</span><span className="setup-detail">{!keepAwakeEnabled ? "Off · display follows macOS idle settings" : !canUseNativeControls ? "Desktop runtime required" : keepAwakeError ? `Unavailable · ${keepAwakeError}` : keepAwakeActive ? "Active · agent is working" : "On · waiting for active work"}</span></span><button className={`pill-btn ${keepAwakeEnabled ? "accent" : ""}`} type="button" onClick={() => onKeepAwakeChange(!keepAwakeEnabled)} data-tauri-drag-region="false" aria-label={`${keepAwakeEnabled ? "Disable" : "Enable"} keep display awake`}>{keepAwakeEnabled ? "On" : "Off"}</button></div>
            </>
          ) : null}

          {activeCategory === "update" ? (
            <>
              <div className="setup-section-heading"><span>Update</span><small>App version and updates</small></div>
              <div className="setup-row passive"><span className="status-slot"><Check className="setup-icon" size={14} strokeWidth={2.3} /></span><span className="setup-copy"><span className="setup-title">Current version</span><span className="setup-detail">{updater.currentVersion ? `v${updater.currentVersion}` : canUseNativeControls ? "Reading version…" : "Desktop runtime required"}</span></span></div>
              <div className="setup-row"><span className="status-slot"><Download className="setup-icon" size={14} strokeWidth={2.3} /></span><span className="setup-copy"><span className="setup-title">App updates</span><span className="setup-detail">{!canUseNativeControls ? "Desktop runtime required" : updater.status === "error" ? (updater.message ?? UPDATER_DETAIL.error) : updater.status === "available" ? `${UPDATER_DETAIL.available}${updater.version ? ` · v${updater.version}` : ""}` : updater.status === "downloading" ? UPDATER_DETAIL.downloading : UPDATER_DETAIL[updater.status]}</span></span>{updater.status === "available" ? (<button className="pill-btn accent" type="button" disabled={!canUseNativeControls} onClick={() => void updater.installAndRelaunch()} data-tauri-drag-region="false"><Download size={12} strokeWidth={2.3} />Update</button>) : (<button className="pill-btn" type="button" disabled={!canUseNativeControls || updater.status === "checking" || updater.status === "downloading"} onClick={() => void updater.check()} data-tauri-drag-region="false"><RefreshCw size={12} strokeWidth={2.3} />Check</button>)}</div>
              {updater.status === "available" ? (
                <div className="update-notes">
                  <div className="update-notes-head"><span>Release notes{updater.version ? ` · v${updater.version}` : ""}</span>{updater.date ? <span className="update-notes-date">{updater.date.slice(0, 10)}</span> : null}</div>
                  <div className="update-notes-body">{updater.notes?.trim() ? updater.notes.trim() : "No release notes provided."}</div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
