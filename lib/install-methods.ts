/**
 * The ways to install TUIOS, as the landing page shows them. Kept outside the
 * client component so the page's structured data can list the same commands.
 */
export const installMethods = [
  {
    id: "brew",
    label: "Homebrew",
    command: "brew install tuios",
  },
  {
    id: "script",
    label: "Script",
    command:
      "curl -fsSL https://raw.githubusercontent.com/Gaurav-Gosain/tuios/main/install.sh | bash",
  },
  { id: "aur", label: "AUR", command: "yay -S tuios-bin" },
  {
    id: "nix",
    label: "Nix",
    command: "nix run github:Gaurav-Gosain/tuios#tuios",
  },
  {
    id: "go",
    label: "Go",
    command: "go install github.com/Gaurav-Gosain/tuios/cmd/tuios@latest",
  },
] as const;
