import Phaser from "phaser";

import { registry } from "../data/registry";
import {
  MAX_PARTY_SIZE,
  getRequiredPartySize,
  movePartyCreatureToLead,
  normalizePartySelection,
  togglePartyCreature,
} from "../game/party";
import { createUiPanel } from "../game/uiSkin";
import { saveWorldState, worldState } from "../game/worldState";
import { GAME_FONT, THEME } from "../game/theme";

export class PartyScene extends Phaser.Scene {
  private ownedCreatureIds: string[] = [];
  private selectedPartyCreatureIds: string[] = [];
  private ownedButtons: Phaser.GameObjects.Text[] = [];
  private selectedButtons: Phaser.GameObjects.Text[] = [];
  private infoText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private closeKeys!: {
    close: Phaser.Input.Keyboard.Key;
    escape: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super("PartyScene");
  }

  create(): void {
    this.ownedCreatureIds = [...worldState.ownedCreatureIds];
    this.selectedPartyCreatureIds = [...worldState.selectedPartyCreatureIds];
    this.closeKeys = this.input.keyboard!.addKeys({
      close: Phaser.Input.Keyboard.KeyCodes.C,
      escape: Phaser.Input.Keyboard.KeyCodes.ESC,
    }) as PartyScene["closeKeys"];

    this.add.rectangle(480, 320, 960, 640, 0x08131f, 0.78);
    createUiPanel({
      scene: this,
      x: 72,
      y: 48,
      width: 816,
      height: 544,
      variant: "warm",
      alpha: 1,
    });
    createUiPanel({
      scene: this,
      x: 112,
      y: 136,
      width: 318,
      height: 338,
      variant: "cool",
      alpha: 0.96,
    });
    createUiPanel({
      scene: this,
      x: 470,
      y: 136,
      width: 378,
      height: 338,
      variant: "cool",
      alpha: 0.96,
    });

    this.add.text(112, 78, "Buddy Party", {
      fontFamily: GAME_FONT,
      fontSize: "32px",
      color: THEME.text,
      fontStyle: "bold",
    });
    this.add.text(112, 110, "Click owned buddies to add/remove them. Click a selected buddy to make it the lead.", {
      fontFamily: GAME_FONT,
      fontSize: "17px",
      color: THEME.textMuted,
      wordWrap: { width: 720 },
    });
    this.add.text(132, 152, "Owned", {
      fontFamily: GAME_FONT,
      fontSize: "24px",
      color: "#ffe8a3",
      fontStyle: "bold",
    });
    this.add.text(490, 152, "Selected For Battle", {
      fontFamily: GAME_FONT,
      fontSize: "24px",
      color: "#b7efc5",
      fontStyle: "bold",
    });

    this.statusText = this.add.text(112, 504, "", {
      fontFamily: GAME_FONT,
      fontSize: "18px",
      color: THEME.textMuted,
      wordWrap: { width: 736 },
    });
    this.infoText = this.add.text(112, 544, "", {
      fontFamily: GAME_FONT,
      fontSize: "18px",
      color: "#ffe8a3",
      wordWrap: { width: 736 },
      fontStyle: "bold",
    });

    this.renderPartyLists();
    this.refreshStatusText();
  }

  update(): void {
    if (
      Phaser.Input.Keyboard.JustDown(this.closeKeys.close) ||
      Phaser.Input.Keyboard.JustDown(this.closeKeys.escape)
    ) {
      this.tryClose();
    }
  }

  private renderPartyLists(): void {
    for (const button of [...this.ownedButtons, ...this.selectedButtons]) {
      button.destroy();
    }
    this.ownedButtons = [];
    this.selectedButtons = [];

    this.ownedCreatureIds.forEach((creatureId, index) => {
      const isSelected = this.selectedPartyCreatureIds.includes(creatureId);
      const creature = registry.creatures[creatureId];
      const button = this.add
        .text(
          132,
          194 + index * 34,
          `${isSelected ? "[IN PARTY]" : "[OWNED]"} ${creature.name}`,
          {
            fontFamily: GAME_FONT,
            fontSize: "18px",
            color: isSelected ? "#b7efc5" : THEME.text,
            fontStyle: "bold",
          },
        )
        .setInteractive({ useHandCursor: true });
      button.on("pointerdown", () => {
        this.selectedPartyCreatureIds = togglePartyCreature(
          this.ownedCreatureIds,
          this.selectedPartyCreatureIds,
          creatureId,
        );
        this.renderPartyLists();
        this.refreshStatusText();
      });
      this.ownedButtons.push(button);
    });

    for (let index = 0; index < MAX_PARTY_SIZE; index += 1) {
      const creatureId = this.selectedPartyCreatureIds[index];
      const creatureName = creatureId ? registry.creatures[creatureId]?.name ?? creatureId : "[Empty]";
      const button = this.add
        .text(
          490,
          194 + index * 54,
          `Slot ${index + 1}: ${creatureName}${index === 0 && creatureId ? "  [Lead]" : ""}`,
          {
            fontFamily: GAME_FONT,
            fontSize: "20px",
            color: creatureId ? THEME.text : "#9cc7d8",
            fontStyle: "bold",
          },
        )
        .setInteractive({ useHandCursor: Boolean(creatureId) });

      if (creatureId) {
        button.on("pointerdown", () => {
          this.selectedPartyCreatureIds = movePartyCreatureToLead(
            this.selectedPartyCreatureIds,
            creatureId,
          );
          this.renderPartyLists();
          this.refreshStatusText();
        });
      }

      this.selectedButtons.push(button);
    }
  }

  private refreshStatusText(): void {
    const required = getRequiredPartySize(this.ownedCreatureIds);
    this.statusText.setText(
      [
        `Owned buddies: ${this.ownedCreatureIds.length}`,
        `Selected buddies: ${this.selectedPartyCreatureIds.length}/${required}`,
        required >= 3
          ? "Choose exactly 3 buddies before leaving the menu."
          : `You only own ${required} buddy${required === 1 ? "" : "ies"} right now, so your current team is smaller.`,
        "Tip: click a selected buddy on the right to move it into the lead slot.",
      ].join("\n"),
    );
    this.infoText.setText("Press C or ESC to confirm and return to the overworld.");
  }

  private tryClose(): void {
    const required = getRequiredPartySize(this.ownedCreatureIds);
    if (this.selectedPartyCreatureIds.length !== required) {
      this.infoText.setText(
        `Pick ${required} battle buddy${required === 1 ? "" : "ies"} before leaving the party menu.`,
      );
      return;
    }

    const normalizedParty = normalizePartySelection(
      this.ownedCreatureIds,
      this.selectedPartyCreatureIds,
    );
    worldState.selectedPartyCreatureIds = normalizedParty;
    worldState.activeCreatureId = normalizedParty[0];
    saveWorldState();
    this.game.events.emit("party-updated", {
      leadCreatureId: normalizedParty[0],
      partySize: normalizedParty.length,
    });
    this.scene.resume("OverworldScene");
    this.scene.stop();
  }
}
