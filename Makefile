# SPDX-License-Identifier: Apache-2.0
include $(TOPDIR)/rules.mk

PKG_NAME:=luci-theme-tealdark
PKG_VERSION:=1.0.0
PKG_RELEASE:=6
PKG_LICENSE:=Apache-2.0
LUCI_TITLE:=TealDark theme for modern LuCI
LUCI_DEPENDS:=+luci-base
LUCI_PKGARCH:=all

define Package/luci-theme-tealdark/postrm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
 uci -q delete luci.themes.TealDark
 [ "$$(uci -q get luci.main.mediaurlbase)" != /luci-static/tealdark ] || uci set luci.main.mediaurlbase=/luci-static/bootstrap
 uci commit luci
}
endef

include ../../luci.mk
# call BuildPackage - OpenWrt buildroot signature
