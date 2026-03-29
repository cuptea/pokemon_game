import Phaser from "phaser";
import { createGame } from "../game/createGame";
import {
  getAvatarLabel,
  getCurrentLanguage,
  getDifficultyLabel,
  getLanguageLabel,
  getSupportedLanguages,
  setCurrentLanguage,
  t,
  type SupportedLanguage,
} from "../game/i18n";
import { GAME_FONT } from "../game/theme";
import {
  continueAsGuest,
  initializeSession,
  isGoogleLoginAvailable,
  signInWithGoogleAccount,
  signOutSession,
  subscribeToSession,
} from "../services/auth";
import { fetchLeaderboardEntries } from "../services/leaderboard";
import type { LeaderboardEntry, SessionUser } from "../types/app";

export function mountAppShell(root: HTMLDivElement): void {
  const app = new AppShell(root);
  void app.mount();
}

class AppShell {
  private root: HTMLDivElement;
  private sessionUser: SessionUser | null = null;
  private gameHost: HTMLDivElement | null = null;
  private phaserGame: Phaser.Game | null = null;
  private unsubscribeSession: (() => void) | null = null;
  private leaderboardEntries: LeaderboardEntry[] = [];
  private leaderboardOpen = false;
  private statusMessage = "";

  constructor(root: HTMLDivElement) {
    this.root = root;
  }

  async mount(): Promise<void> {
    this.root.style.fontFamily = GAME_FONT;
    this.sessionUser = await initializeSession();
    this.unsubscribeSession = subscribeToSession((user) => {
      this.sessionUser = user;
      this.statusMessage = "";
      void this.render();
    });
    window.addEventListener("beforeunload", () => {
      this.unsubscribeSession?.();
    });
    await this.refreshLeaderboard();
    await this.render();
  }

  private async render(): Promise<void> {
    if (!this.sessionUser) {
      this.destroyGame();
      this.renderLogin();
      return;
    }

    this.renderGameShell();
    if (!this.phaserGame && this.gameHost) {
      this.phaserGame = createGame(this.gameHost);
    }
  }

  private renderLogin(): void {
    this.root.innerHTML = "";
    this.root.style.background =
      "radial-gradient(circle at top, #203b57 0%, #0e1827 45%, #08131f 100%)";
    this.root.style.display = "flex";
    this.root.style.alignItems = "center";
    this.root.style.justifyContent = "center";

    const shell = document.createElement("div");
    shell.style.width = "min(1120px, 100vw)";
    shell.style.minHeight = "100vh";
    shell.style.display = "grid";
    shell.style.gridTemplateColumns = "1.05fr 0.95fr";
    shell.style.gap = "24px";
    shell.style.padding = "32px";
    shell.style.boxSizing = "border-box";

    const hero = document.createElement("section");
    hero.style.border = "4px solid #9cc7d8";
    hero.style.background = "rgba(16, 36, 59, 0.92)";
    hero.style.boxShadow = "0 18px 50px rgba(0, 0, 0, 0.35)";
    hero.style.padding = "34px";
    hero.style.borderRadius = "18px";

    const languageRow = document.createElement("div");
    languageRow.style.display = "flex";
    languageRow.style.justifyContent = "flex-end";
    languageRow.style.marginBottom = "18px";
    languageRow.append(this.createLanguageSelector());

    const title = document.createElement("h1");
    title.textContent = t("app.login_title");
    title.style.margin = "0 0 14px";
    title.style.fontSize = "44px";
    title.style.lineHeight = "1.05";
    title.style.color = "#ffe8a3";

    const copy = document.createElement("p");
    copy.textContent = t("app.login_copy");
    copy.style.margin = "0 0 22px";
    copy.style.fontSize = "18px";
    copy.style.lineHeight = "1.6";
    copy.style.color = "#d9f0ff";

    const actionRow = document.createElement("div");
    actionRow.style.display = "flex";
    actionRow.style.flexWrap = "wrap";
    actionRow.style.gap = "14px";
    actionRow.style.marginBottom = "18px";

    const googleButton = makeButton(
      isGoogleLoginAvailable() ? t("app.google_sign_in") : t("app.google_missing"),
      "#ffe066",
      "#08131f",
      () => {
        void this.handleGoogleLogin();
      },
    );
    googleButton.disabled = !isGoogleLoginAvailable();
    googleButton.style.opacity = isGoogleLoginAvailable() ? "1" : "0.65";
    googleButton.style.cursor = isGoogleLoginAvailable() ? "pointer" : "not-allowed";

    const guestButton = makeButton(t("app.guest_continue"), "#84dcc6", "#08131f", () => {
      void this.handleGuestLogin();
    });

    actionRow.append(googleButton, guestButton);

    const notes = document.createElement("div");
    notes.style.display = "grid";
    notes.style.gap = "10px";
    notes.style.color = "#d9f0ff";
    notes.style.fontSize = "15px";
    notes.innerHTML = [
      t("app.note_google"),
      t("app.note_score"),
      isGoogleLoginAvailable() ? t("app.note_remote") : t("app.note_local"),
    ]
      .map((line) => `<div>${line}</div>`)
      .join("");

    if (this.statusMessage) {
      const status = document.createElement("div");
      status.textContent = this.statusMessage;
      status.style.marginTop = "18px";
      status.style.padding = "12px 14px";
      status.style.border = "2px solid #f6bd60";
      status.style.background = "rgba(246, 189, 96, 0.16)";
      status.style.color = "#ffe8a3";
      status.style.borderRadius = "12px";
      hero.append(languageRow, title, copy, actionRow, notes, status);
    } else {
      hero.append(languageRow, title, copy, actionRow, notes);
    }

    const leaderboard = this.renderLeaderboardCard(t("app.top_trainers"));
    shell.append(hero, leaderboard);
    this.root.append(shell);
  }

  private renderGameShell(): void {
    this.root.innerHTML = "";
    this.root.style.display = "grid";
    this.root.style.gridTemplateRows = "74px 1fr";
    this.root.style.background = "#08131f";

    const topBar = document.createElement("header");
    topBar.style.display = "flex";
    topBar.style.alignItems = "center";
    topBar.style.justifyContent = "space-between";
    topBar.style.padding = "14px 20px";
    topBar.style.boxSizing = "border-box";
    topBar.style.borderBottom = "2px solid rgba(156, 199, 216, 0.34)";
    topBar.style.background = "linear-gradient(180deg, rgba(16,36,59,0.98), rgba(9,22,34,0.98))";

    const identity = document.createElement("div");
    identity.style.display = "flex";
    identity.style.flexDirection = "column";
    identity.style.gap = "4px";

    const userLabel = document.createElement("strong");
    userLabel.textContent = this.sessionUser?.displayName ?? t("app.trainer_default");
    userLabel.style.fontSize = "18px";
    userLabel.style.color = "#f8f9fa";

    const modeLabel = document.createElement("span");
    modeLabel.textContent =
      this.sessionUser?.provider === "google"
        ? t("app.signed_in_google")
        : t("app.guest_mode");
    modeLabel.style.fontSize = "13px";
    modeLabel.style.color = "#d9f0ff";

    identity.append(userLabel, modeLabel);

    const buttons = document.createElement("div");
    buttons.style.display = "flex";
    buttons.style.alignItems = "center";
    buttons.style.gap = "12px";

    buttons.append(this.createLanguageSelector());

    const leaderboardButton = makeButton(t("app.leaderboard"), "#ffe066", "#08131f", () => {
      this.leaderboardOpen = true;
      void this.refreshLeaderboard().then(() => {
        this.renderGameShell();
      });
    });
    leaderboardButton.style.padding = "10px 16px";
    leaderboardButton.style.fontSize = "15px";

    const signOutButton = makeButton(t("app.sign_out"), "#ffb703", "#08131f", () => {
      void signOutSession();
    });
    signOutButton.style.padding = "10px 16px";
    signOutButton.style.fontSize = "15px";

    buttons.append(leaderboardButton, signOutButton);
    topBar.append(identity, buttons);

    const content = document.createElement("div");
    content.style.position = "relative";
    content.style.minHeight = "0";

    if (!this.gameHost) {
      this.gameHost = document.createElement("div");
    }
    this.gameHost.style.width = "100%";
    this.gameHost.style.height = "100%";
    this.gameHost.style.minHeight = "calc(100vh - 74px)";
    content.append(this.gameHost);

    if (this.leaderboardOpen) {
      const modal = document.createElement("div");
      modal.style.position = "absolute";
      modal.style.inset = "0";
      modal.style.background = "rgba(8, 19, 31, 0.76)";
      modal.style.display = "grid";
      modal.style.placeItems = "center";
      modal.style.padding = "24px";
      modal.style.boxSizing = "border-box";
      modal.addEventListener("click", () => {
        this.leaderboardOpen = false;
        this.renderGameShell();
      });

      const card = this.renderLeaderboardCard(t("app.leaderboard"));
      card.style.width = "min(720px, 92vw)";
      card.style.maxHeight = "80vh";
      card.style.overflow = "auto";
      card.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      modal.append(card);
      content.append(modal);
    }

    this.root.append(topBar, content);
  }

  private renderLeaderboardCard(titleText: string): HTMLElement {
    const card = document.createElement("section");
    card.style.border = "4px solid #9cc7d8";
    card.style.background = "rgba(16, 36, 59, 0.94)";
    card.style.boxShadow = "0 18px 50px rgba(0, 0, 0, 0.35)";
    card.style.padding = "26px";
    card.style.borderRadius = "18px";

    const title = document.createElement("h2");
    title.textContent = titleText;
    title.style.margin = "0 0 18px";
    title.style.fontSize = "28px";
    title.style.color = "#ffe8a3";

    const table = document.createElement("div");
    table.style.display = "grid";
    table.style.gap = "10px";

    if (this.leaderboardEntries.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = t("app.no_scores");
      empty.style.color = "#d9f0ff";
      empty.style.fontSize = "16px";
      table.append(empty);
    } else {
      this.leaderboardEntries.forEach((entry, index) => {
        const row = document.createElement("div");
        row.style.display = "grid";
        row.style.gridTemplateColumns = "58px 1fr auto";
        row.style.gap = "14px";
        row.style.alignItems = "center";
        row.style.padding = "12px 14px";
        row.style.border = "2px solid rgba(156, 199, 216, 0.28)";
        row.style.borderRadius = "12px";
        row.style.background = index === 0 ? "rgba(255, 224, 102, 0.14)" : "rgba(9, 22, 34, 0.65)";

        const rank = document.createElement("strong");
        rank.textContent = `#${index + 1}`;
        rank.style.color = "#ffe8a3";
        rank.style.fontSize = "22px";

        const meta = document.createElement("div");
        meta.innerHTML = `
          <div style="color:#f8f9fa;font-size:17px;font-weight:700;">${escapeHtml(entry.displayName)}</div>
          <div style="color:#d9f0ff;font-size:13px;">${escapeHtml(
            t("app.row_meta", {
              avatar: getAvatarLabel(entry.avatar),
              difficulty: getDifficultyLabel(entry.difficulty),
              victories: entry.victories,
              discoveries: entry.discoveries,
              owned: entry.ownedCount,
            }),
          )}</div>
        `;

        const score = document.createElement("div");
        score.textContent = `${entry.score}`;
        score.style.color = "#84dcc6";
        score.style.fontSize = "24px";
        score.style.fontWeight = "700";

        row.append(rank, meta, score);
        table.append(row);
      });
    }

    card.append(title, table);
    return card;
  }

  private async handleGoogleLogin(): Promise<void> {
    try {
      await signInWithGoogleAccount();
      await this.refreshLeaderboard();
    } catch (error) {
      this.statusMessage =
        error instanceof Error ? error.message : t("app.google_failed");
      this.renderLogin();
    }
  }

  private async handleGuestLogin(): Promise<void> {
    await continueAsGuest();
    await this.refreshLeaderboard();
  }

  private async refreshLeaderboard(): Promise<void> {
    this.leaderboardEntries = await fetchLeaderboardEntries();
  }

  private destroyGame(): void {
    if (this.phaserGame) {
      this.phaserGame.destroy(true);
      this.phaserGame = null;
    }

    this.gameHost = null;
  }

  private createLanguageSelector(): HTMLElement {
    const wrapper = document.createElement("label");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "10px";
    wrapper.style.color = "#d9f0ff";
    wrapper.style.fontSize = "14px";
    wrapper.style.fontWeight = "700";

    const label = document.createElement("span");
    label.textContent = t("language.label");

    const select = document.createElement("select");
    select.value = getCurrentLanguage();
    select.style.border = "2px solid rgba(156, 199, 216, 0.38)";
    select.style.borderRadius = "999px";
    select.style.padding = "8px 12px";
    select.style.background = "#10243b";
    select.style.color = "#f8f9fa";
    select.style.font = "inherit";
    for (const language of getSupportedLanguages()) {
      const option = document.createElement("option");
      option.value = language;
      option.textContent = getLanguageLabel(language);
      select.append(option);
    }
    select.addEventListener("change", () => {
      this.handleLanguageChange(select.value as SupportedLanguage);
    });

    wrapper.append(label, select);
    return wrapper;
  }

  private handleLanguageChange(language: SupportedLanguage): void {
    setCurrentLanguage(language);
    if (this.sessionUser) {
      window.location.reload();
      return;
    }
    void this.render();
  }
}

function makeButton(
  label: string,
  background: string,
  color: string,
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.style.border = "0";
  button.style.borderRadius = "999px";
  button.style.padding = "14px 20px";
  button.style.fontSize = "16px";
  button.style.fontWeight = "800";
  button.style.background = background;
  button.style.color = color;
  button.style.cursor = "pointer";
  button.style.boxShadow = "0 10px 24px rgba(0, 0, 0, 0.22)";
  button.addEventListener("click", onClick);
  return button;
}

function escapeHtml(value: string): string {
  return value
    .split("&")
    .join("&amp;")
    .split("<")
    .join("&lt;")
    .split(">")
    .join("&gt;")
    .split('"')
    .join("&quot;")
    .split("'")
    .join("&#39;");
}
