export function shouldRemoveWildRoamerAfterBattle(
  outcome: "win" | "lose" | "escape",
): boolean {
  return outcome === "win";
}
