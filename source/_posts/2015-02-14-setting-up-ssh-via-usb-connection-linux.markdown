---
layout: post
title: "Setting up SSH via USB connection on Linux"
date: 2015-02-14 15:36:18 -0800
comments: true
categories: SBBlog
author: CoolStar
---
This is a version of Aehmlo's original post, modified for Linux.

When developing tweaks (or making themes, for that matter), it is often annoying to wait for files to copy (and commands to execute) over Wi-Fi - it tends to be very slow and sometimes unreliable, and one must keep track of IP addresses and such (even if they use a hosts file to map custom hostnames) in order to accomplish it. This annoyance can be greatly relieved by creating a local tunnel over a USB connection to the target device, and using that to SSH to the device much more quickly and reliably. In this tutorial, we will cover how to set up your Linux PC (Windows & OS X are on other posts) so that port 2022 is forwarded to port 22 on whatever device is plugged in.

<!--more-->

First things first, make sure you have a recent version of libimobiledevice installed.

In terminal, run the following command to start the tunneling:

"iproxy 2022 22"

Wasn't that easy?

If you use this with multiple devices, you'll notice a problem: you'll get a scary host key changed warning:

```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
```

The trick to avoiding this is to set the known hosts file to `/dev/null` when you're connecting to localhost:2022. Create `~/.ssh/config` if you don't already have it and add the following:

```
Host local
	User root
	HostName localhost
	Port 2022
	StrictHostKeyChecking no
	UserKnownHostsFile=/dev/null
```

You can now use `ssh local` no matter what device is plugged in.

To use this with Theos, you can export the IP to the host alias and the port to 2022:

```bash
export THEOS_DEVICE_IP=local THEOS_DEVICE_PORT=2022
```

It would be ideal to also put this in your shell's profile script (`~/.bash_profile`, `~/.zshrc`, etc) so it's set by default and you don't have to worry about it.

Plug in a jailbroken iOS device, copy your SSH key to it if you haven't already... 

```bash
ssh local 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys' < ~/.ssh/id_rsa.pub
```

...and enjoy the blazingly fast transfer speed! Isn't this much better than boring ol' Wi-Fi?
