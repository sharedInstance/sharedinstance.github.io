---
layout: post
title: "Setting up SSH via USB connection on Windows"
date: 2015-02-14 15:28:08 -0800
comments: true
categories: SBBlog
author: CoolStar
---
This is a version of Aehmlo's original post, modified for Windows.

When developing tweaks (or making themes, for that matter), it is often annoying to wait for files to copy (and commands to execute) over Wi-Fi - it tends to be very slow and sometimes unreliable, and one must keep track of IP addresses and such (even if they use a hosts file to map custom hostnames) in order to accomplish it. This annoyance can be greatly relieved by creating a local tunnel over a USB connection to the target device, and using that to SSH to the device much more quickly and reliably. In this tutorial, we will cover how to set up your Windows PC (Linux and OS X are on other posts) so that port 2022 is forwarded to port 22 on whatever device is plugged in.

<!--more-->

First things first, download the client from its [download page](https://code.google.com/p/iphonetunnel-usbmuxconnectbyport/downloads/detail?name=itunnel_mux_rev71.zip) (note that you will need Windows XP and iTunes 10.5 or later for the client to work). Extract this zip (make sure you extract both the executable and the dll).

In Command Prompt, cd to the folder you extracted the zip to and run the following:

"itunnel_mux --iport 22 --lport 2022"

From now on, the relay we have set up will always be running the background once you log in. Try it out in PuTTY by connecting to SSH at localhost port 22.

To use this with Theos, you can export the IP to the host alias and the port to 2222:

```bash
export THEOS_DEVICE_IP=localhost THEOS_DEVICE_PORT=2022
```

It would be ideal to also put this in cygwin's profile script (`~/.bash_profile`, `~/.zshrc`, etc) so it's set by default and you don't have to worry about it.

Plug in a jailbroken iOS device, copy your SSH key to it if you haven't already (if you have one set up in Cygwin) ... 

```bash
ssh local 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys' < ~/.ssh/id_rsa.pub
```

...and enjoy the blazingly fast transfer speed! Isn't this much better than boring ol' Wi-Fi?
