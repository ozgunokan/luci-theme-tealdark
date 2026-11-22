#!/bin/sh
# SPDX-License-Identifier: Apache-2.0
set -eu
APK_TOOL=${APK_TOOL:-apk}
root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT HUP INT TERM
mkdir -p "$stage/www" "$stage/usr/share/ucode/luci"
cp -R "$root/htdocs/." "$stage/www/"
cp -R "$root/ucode/." "$stage/usr/share/ucode/luci/"
cp -R "$root/root/." "$stage/"
find "$stage" -type d -exec chmod 755 {} +
find "$stage" -type f -exec chmod 644 {} +
chmod 755 "$stage/etc/uci-defaults/30_luci-theme-tealdark"
"$APK_TOOL" mkpkg --compat 3.0.0 --info name:luci-theme-tealdark --info version:1.0.0-r6 --info arch:noarch --info 'description:TealDark theme for modern OpenWrt LuCI' --info license:Apache-2.0 --info depends:luci-base --files "$stage" --script "post-install:$root/tools/post-install.sh" --script "post-deinstall:$root/tools/post-deinstall.sh" --output "${1:-luci-theme-tealdark-1.0.0-r6.apk}"
