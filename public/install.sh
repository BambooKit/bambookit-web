#!/usr/bin/env bash
# BambooKit Desktop installer for macOS.
#   curl -fsSL https://bambookit-web.onrender.com/install.sh | bash
# Downloads the latest BambooKit Desktop DMG for this Mac (Apple Silicon or Intel) from GitHub Releases,
# installs BambooKit.app into /Applications (or ~/Applications without admin rights), clears the download
# quarantine so the app (not notarized yet) opens normally, and launches it.
# Set BAMBOOKIT_VERSION=1.0.8 to install a specific version instead of the latest,
# or BAMBOOKIT_DMG=/path/to/BambooKit.dmg to install a DMG you already downloaded.

set -euo pipefail

REPO="BambooKit/bambookit-mac"
APP_NAME="BambooKit.app"

info() { printf '\033[1m==>\033[0m %s\n' "$*"; }
fail() { printf '\033[31mError:\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(uname -s)" = "Darwin" ] || fail "This installer is for macOS. For Windows, see https://bambookit-web.onrender.com/#install"

case "$(uname -m)" in
  arm64) ARCH="arm64"; ARCH_LABEL="Apple Silicon" ;;
  x86_64)
    # Under Rosetta, uname reports x86_64 on an Apple Silicon Mac; prefer the native build.
    if [ "$(sysctl -in sysctl.proc_translated 2>/dev/null || echo 0)" = "1" ]; then ARCH="arm64"; ARCH_LABEL="Apple Silicon"
    else ARCH="x64"; ARCH_LABEL="Intel"; fi ;;
  *) fail "Unsupported processor: $(uname -m)" ;;
esac

TMP_DIR="$(mktemp -d)"
MOUNT_DIR="$TMP_DIR/mount"
cleanup() {
  hdiutil detach "$MOUNT_DIR" -quiet >/dev/null 2>&1 || true
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if [ -n "${BAMBOOKIT_DMG:-}" ]; then
  [ -f "$BAMBOOKIT_DMG" ] || fail "No such file: $BAMBOOKIT_DMG"
  DMG_PATH="$BAMBOOKIT_DMG"
  VERSION="$(basename "$DMG_PATH" | sed -n 's/^BambooKit-\([0-9][^-]*\)-mac-.*/\1/p')"
  VERSION="${VERSION:-(local)}"
else
  if [ -n "${BAMBOOKIT_VERSION:-}" ]; then
    API_URL="https://api.github.com/repos/$REPO/releases/tags/v${BAMBOOKIT_VERSION#v}"
  else
    API_URL="https://api.github.com/repos/$REPO/releases/latest"
  fi

  info "Finding the latest BambooKit release for $ARCH_LABEL..."
  RELEASE_JSON="$(curl -fsSL -H 'Accept: application/vnd.github+json' "$API_URL")" || fail "Could not reach GitHub releases for $REPO."
  DMG_URL="$(printf '%s' "$RELEASE_JSON" | grep -o '"browser_download_url": *"[^"]*-mac-'"$ARCH"'\.dmg"' | head -n1 | sed 's/.*"\(https[^"]*\)"/\1/')"
  VERSION="$(printf '%s' "$RELEASE_JSON" | grep -o '"tag_name": *"[^"]*"' | head -n1 | sed 's/.*"v\{0,1\}\([^"]*\)"/\1/')"
  [ -n "$DMG_URL" ] || fail "The release has no $ARCH_LABEL (.dmg) download."

  info "Downloading BambooKit $VERSION ($ARCH_LABEL)..."
  DMG_PATH="$TMP_DIR/BambooKit.dmg"
  curl -fL --progress-bar -o "$DMG_PATH" "$DMG_URL" || fail "Download failed."
fi

info "Opening the disk image..."
mkdir -p "$MOUNT_DIR"
hdiutil attach "$DMG_PATH" -nobrowse -noautoopen -readonly -mountpoint "$MOUNT_DIR" -quiet || fail "Could not open the disk image."
SOURCE_APP="$(find "$MOUNT_DIR" -maxdepth 1 -name '*.app' -print -quit)"
[ -n "$SOURCE_APP" ] || fail "The disk image does not contain an app."

if [ -w /Applications ]; then DEST_DIR="/Applications"; else DEST_DIR="$HOME/Applications"; mkdir -p "$DEST_DIR"; fi
DEST_APP="$DEST_DIR/$APP_NAME"

if pgrep -xq BambooKit; then
  info "Closing the running BambooKit..."
  osascript -e 'tell application "BambooKit" to quit' >/dev/null 2>&1 || true
  for _ in 1 2 3 4 5 6 7 8 9 10; do pgrep -xq BambooKit || break; sleep 1; done
fi

info "Installing to $DEST_APP..."
rm -rf "$DEST_APP"
ditto "$SOURCE_APP" "$DEST_APP"
# The app is not notarized by Apple yet; without this Gatekeeper refuses to open a downloaded copy.
xattr -dr com.apple.quarantine "$DEST_APP" 2>/dev/null || true

info "BambooKit $VERSION is installed. Opening it..."
open "$DEST_APP"
