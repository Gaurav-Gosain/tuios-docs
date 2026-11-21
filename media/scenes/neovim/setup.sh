#!/usr/bin/env bash
source "$MEDIA/lib/project.sh"
# The built-in themes as theme files, so tuios-look-sync.nvim can read the
# colours of the theme that tuios shows.
# Export to a file outside the themes folder first: tuios reads that folder,
# and an empty file there named for the theme would hide the built-in one.
themes=$XDG_CONFIG_HOME/tuios/themes
mkdir -p "$themes"
for theme in catppuccin_mocha catppuccin_latte; do
  tuios theme export "$theme" --full >"$TMPDIR/$theme.json"
  [[ -s $TMPDIR/$theme.json ]] || { echo "neovim: tuios theme export $theme wrote nothing" >&2; exit 1; }
  mv "$TMPDIR/$theme.json" "$themes/"
done
# Neovim with the two plugins from the media image.
mkdir -p "$XDG_CONFIG_HOME/nvim"
cat >"$XDG_CONFIG_HOME/nvim/init.lua" <<'LUA'
for _, dir in ipairs(vim.fn.glob("/opt/nvim-plugins/*", false, true)) do
  vim.opt.runtimepath:append(dir)
end
vim.o.number = true
vim.o.cursorline = true
vim.o.wrap = false
vim.o.termguicolors = true
vim.o.swapfile = false
require("tuios-nvim-navigator").setup()
require("tuios-look-sync").setup({ fallback = "default" })
vim.cmd.colorscheme("tuios")
LUA
