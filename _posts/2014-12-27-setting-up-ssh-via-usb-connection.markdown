---
layout: post
title: "Setting up SSH via USB connection on OS X"
date: 2014-12-27 22:33:02 -0600
comments: true
categories: SBBlog
author: Aehmlo
---

When developing tweaks (or making themes, for that matter), it is often annoying to wait for files to copy (and commands to execute) over Wi-Fi - it tends to be very slow and sometimes unreliable, and one must keep track of IP addresses and such (even if they use a hosts file to map custom hostnames) in order to accomplish it. This annoyance can be greatly relieved by creating a local tunnel over a USB connection to the target device, and using that to SSH to the device much more quickly and reliably. In this tutorial, we will cover how to set up your Mac (not PC, sorry - I am not knowledgable enough to write on this) so that port 2222 is forwarded to port 22 on whatever device is plugged in. This service will be started automatically and will run in the background at all times, out of sight and out of mind.

First things first, download the client from its [download page](https://code.google.com/p/iphonetunnel-usbmuxconnectbyport/downloads/detail?name=itnl_rev8.zip) (note that you will need iTunes 10.5 or later for the client to work). Extract this zip, and move the extracted contents to `~/Library/Application Support/usbmuxd/` (or something else, if you wish, but make sure to change the path in the plist accordingly) - both `tunl` and `libmd.dylib`.

Now, create a new file named `net.sharedinstance.tcprelay.plist` in `~/Library/LaunchAgents`. Inside this file, put the following:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>net.sharedinstance.tcprelay</string>
	<key>KeepAlive</key>
	<dict>
		<key>NetworkState</key>
		<true/>
	</dict>
	<key>ProgramArguments</key>
	<array>
		<string>/Users/USER/Library/Application Support/usbmuxd/itnl</string>
		<string>--iport</string>
		<string>22</string>
		<string>--lport</string>
		<string>2222</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
</dict>
</plist>
```

Be sure to replace USER above with your username (and if you put the executable elsewhere, make sure to change the first item in the ProgramArguments array to reflect that). Make sure that the itnl executable is, well, executable. Then, give the plist appropriate permissions - `chmod 0644 ~/Library/LaunchAgents/net.sharedinstance.tcprelay.plist`, and load this launch agent we have created - `launchctl load ~/Library/LaunchAgents/net.sharedinstance.tcprelay.plist`.

From now on, the relay we have set up will always be running the background once you log in. Try it out now with `ssh -p 2222 mobile@localhost`.

If you use this with multiple devices, you'll notice a problem: you'll get a scary host key changed warning:

```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
```

The trick to avoiding this is to set the known hosts file to `/dev/null` when you're connecting to localhost:2222. Create `~/.ssh/config` if you don't already have it and add the following:

```
Host local
	User root
	HostName localhost
	Port 2222
	StrictHostKeyChecking no
	UserKnownHostsFile=/dev/null
```

You can now use `ssh local` no matter what device is plugged in.

To use this with Theos, you can export the IP to the host alias and the port to 2222:

```bash
export THEOS_DEVICE_IP=local THEOS_DEVICE_PORT=2222
```

It would be ideal to also put this in your shell's profile script (`~/.bash_profile`, `~/.zshrc`, etc) so it's set by default and you don't have to worry about it.

Plug in a jailbroken iOS device, copy your SSH key to it if you haven't already... 

```bash
ssh local 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys' < ~/.ssh/id_rsa.pub
```

...and enjoy the blazingly fast transfer speed! Isn't this much better than boring ol' Wi-Fi?
