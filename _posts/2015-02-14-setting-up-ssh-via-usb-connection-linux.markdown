---
layout: post
title: "Setting up SSH via USB connection on Linux"
date: 2015-02-14 15:36:18 -0800
comments: true
categories: SBBlog
author: CoolStar
---

This is a version of Aehmlo's original post, modified for Linux.

When developing tweaks (or making themes, for that matter), it is often annoying to wait for files to copy (and commands to execute) over Wi-Fi - it tends to be very slow and sometimes unreliable, and one must keep track of IP addresses and such (even if they use a hosts file to map custom hostnames) in order to accomplish it. This annoyance can be greatly relieved by creating a local tunnel over a USB connection to the target device, and using that to SSH to the device much more quickly and reliably. In this tutorial, we will cover how to set up your Linux PC (there are other posts for [Windows](/2015/02/setting-up-ssh-via-usb-connection-win/) and [OS X](/2014/12/setting-up-ssh-via-usb-connection/)) so that port 2222 is forwarded to port 22 on whatever device is plugged in.

First things first, make sure you have a recent version of usbmuxd installed, as well as its utilities. On Debian and Ubuntu, the package name is `usbmuxd`.

In a terminal, run the following command to start the tunneling:

```bash
iproxy 2222 22
```

That's it!

Having this run all the time in the background is different depending on what daemon system your distro uses. If your distro uses Upstart, such as Ubuntu, create a file as root at `/etc/init/iproxy.conf`:

```bash
sudo nano /etc/init/iproxy.conf
```

Enter the following:

```
start on runlevel [2345]
stop on runlevel [!2345]

setuid nobody
setgid nogroup

exec /usr/bin/iproxy 2222 22
```

Use `sudo start iproxy` to start it without having to reboot.

Take a look at the [original OS X post](/2014/12/setting-up-ssh-via-usb-connection/) to find out how to use this with Theos, and to prevent a false security error if you plug in a different device.
