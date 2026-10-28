import { describe, expect, it } from "vitest";
import {
  BETA_CLUB_MISSIONS_URL,
  JAVACHRIST_DISCORD_INVITE_URL,
  getJavaChristDiscordInviteUrl
} from "./beta-club";

describe("getJavaChristDiscordInviteUrl", () => {
  it("utilise l'invitation JavaChrist par défaut", () => {
    expect(JAVACHRIST_DISCORD_INVITE_URL).toBe("https://discord.gg/7mD8UgBGv4");
    expect(getJavaChristDiscordInviteUrl()).toBe("https://discord.gg/7mD8UgBGv4");
  });

  it("retourne null si une valeur vide est fournie explicitement", () => {
    expect(getJavaChristDiscordInviteUrl("")).toBeNull();
    expect(getJavaChristDiscordInviteUrl("   ")).toBeNull();
  });

  it("rejette un lien de salon Discord (réservé aux membres)", () => {
    expect(
      getJavaChristDiscordInviteUrl("https://discord.com/channels/1254566774117240904/1538597919324766218")
    ).toBeNull();
  });

  it("rejette une destination vide ou invalide", () => {
    expect(getJavaChristDiscordInviteUrl("#")).toBeNull();
    expect(getJavaChristDiscordInviteUrl("not-a-url")).toBeNull();
  });

  it("accepte une invitation discord.gg ou /invite/", () => {
    expect(getJavaChristDiscordInviteUrl("https://discord.gg/exemple")).toBe("https://discord.gg/exemple");
    expect(getJavaChristDiscordInviteUrl("https://discord.com/invite/exemple")).toBe(
      "https://discord.com/invite/exemple"
    );
  });
});

describe("BETA_CLUB_MISSIONS_URL", () => {
  it("pointe vers l'application Beta Club", () => {
    expect(BETA_CLUB_MISSIONS_URL).toBe("https://java-christ-beta-club.vercel.app/");
  });
});
