#!/bin/sh
uci -q set luci.themes.TealDark='/luci-static/tealdark'
uci commit luci
exit 0
