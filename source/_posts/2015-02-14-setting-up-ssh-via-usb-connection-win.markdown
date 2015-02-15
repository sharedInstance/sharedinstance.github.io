---
layout: post
title: "Setting up SSH via USB connection on Windows"
date: 2015-02-14 15:28:08 -0800
comments: true
categories: SBBlog
author: CoolStar
---

This is a version of Aehmlo's original post, modified for Windows.

When developing tweaks (or making themes, for that matter), it is often annoying to wait for files to copy (and commands to execute) over Wi-Fi - it tends to be very slow and sometimes unreliable, and one must keep track of IP addresses and such (even if they use a hosts file to map custom hostnames) in order to accomplish it. This annoyance can be greatly relieved by creating a local tunnel over a USB connection to the target device, and using that to SSH to the device much more quickly and reliably. In this tutorial, we will cover how to set up your Windows PC (there are other posts for [Linux](/2015/02/setting-up-ssh-via-usb-connection-linux/) and [OS X](/2014/12/setting-up-ssh-via-usb-connection/)) so that port 2222 is forwarded to port 22 on whatever device is plugged in.

<!--more-->

First things first, download the client from its [download page](https://code.google.com/p/iphonetunnel-usbmuxconnectbyport/downloads/detail?name=itunnel_mux_rev71.zip) (note that you will need Windows XP and iTunes 10.5 or later for the client to work). Extract this zip - make sure you extract both the executable and the dll.

In Command Prompt, `cd` to the folder you extracted the zip to and run the following:

```bash
itunnel_mux --iport 22 --lport 2222
```

From now on, the relay we have set up will always be running the background once you log in. Try it out in PuTTY by connecting to SSH at localhost, port 2222.

If you use Cygwin, you can easily register this as a Windows service so it's always running. You will need to use the Cygwin setup from [cygwin.com](https://cygwin.com) to install *cygrunsrv*, under the Admin category. Now, from a Cygwin shell run as an administrator:

```bash
cygrunsrv -I iTunnel -p /cygdrive/c/path/to/itunnel_mux.exe -a '--iport 22 --lport 2222' -u 'NETWORK SERVICE' -y 'Apple Mobile Device'
net start itunnel
```

This creates a service with the name `itunnel`, which will run itunnel_mux.exe with the provided arguments. It'll execute as Windows' built in `NetworkService` account, and requires the Apple Mobile Device service to be up and running before iTunnel can start.

When you update Cygwin packages, you should execute `net stop itunnel` (again, as an administrator) before the update and `net start itunnel` after. Otherwise, you may be told to restart your computer to replace in-use files.

Take a look at the [original OS X post](/2014/12/setting-up-ssh-via-usb-connection/) to find out how to use this with Theos, and to prevent a false security error if you plug in a different device.
