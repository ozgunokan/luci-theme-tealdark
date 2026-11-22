#!/bin/sh
uci -q delete luci.themes.TealDark
if [ "$(uci -q get luci.main.mediaurlbase)" = '/luci-static/tealdark' ]; then
 uci set luci.main.mediaurlbase='/luci-static/bootstrap'
fi
uci commit luci
exit 0
