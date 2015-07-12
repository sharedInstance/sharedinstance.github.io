---
layout: post
title: "Adding simple toggles in the Settings root list"
date: 2014-04-18 11:04:22 +0930
comments: true
categories: SBBlog
author: kirb
---

I just wanted to post a quick trick you can use to show a toggle in the root Settings list view.

If you generate a new preference bundle project with NIC and open `entry.plist`, you'll find this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>entry</key>
	<dict>
		<key>bundle</key>
		<string>TypeStatus</string>
		<key>cell</key>
		<string>PSLinkCell</string>
		<key>detail</key>
		<string>HBTSListController</string>
		<key>icon</key>
		<string>icon.png</string>
		<key>isController</key>
		<true/>
		<key>label</key>
		<string>TypeStatus</string>
	</dict>
</dict>
</plist>
```

Indeed, the cells shown in the root of Settings courtesy of PreferenceLoader are customizable. You could slap your whole settings panel there if you wanted (but that's clearly not a good idea). What you _could_ do, though, is use it for tweaks whose settings consist of nothing more than an "enabled" toggle.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>entry</key>
	<dict>
		<key>cell</key>
		<string>PSSwitchCell</string>
		<key>default</key>
		<true/>
		<key>defaults</key>
		<string>ws.hbang.typestatus</string>
		<key>icon</key>
		<string>TypeStatus.png</string>
		<key>label</key>
		<string>TypeStatus</string>
		<key>key</key>
		<string>Enabled</string>
		<key>PostNotification</key>
		<string>ws.hbang.typestatus/ReloadPrefs</string>
	</dict>
</dict>
</plist>
```

The icon can be dropped at `/Library/PreferenceLoader/Preferences/TypeStatus.png`. Unfortunately for themers, this means it can't be themed with WinterBoard.

Ok, that's easy enough, but I mention this because if one or two tweaks did this, it would look pretty odd. If more tweaks do this, it'll look completely normal. And, as Ryan Petrich noted in his [WWJC talk](http://rpetri.ch/wwjc2014/rpetrich_wwjc2014.pdf) a few days ago, every tweak should have settings - even if it's just a single on/off switch.
