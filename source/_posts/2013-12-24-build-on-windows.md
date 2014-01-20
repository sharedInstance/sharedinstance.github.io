---
layout: post
title: "How to build jailbreak packages for iOS on Windows"
date: 2013-12-24
categories: SBBlog
author: kirb
---

Want to develop jailbreak packages, but don't have a Mac? You could easily download a toolchain on your iPhone and build packages on there, but if you have a Windows computer, you could instead use the extra speed that a desktop CPU provides, thanks to [coolstar](http://coolstar.org)'s fork of theos and toolchain for Windows. At least Windows XP is required for this.

<!--more-->

## Cygwin
[![Cygwin website](http://sharedinstance.net/wp-content/uploads/2013/12/Screen-Shot-2013-12-13-at-4.10.16-pm-1024x766.png)](http://sharedinstance.net/wp-content/uploads/2013/12/Screen-Shot-2013-12-13-at-4.10.16-pm.png)

The toolchain requires Cygwin, an awesome piece of software that provides a Unix environment on Windows. Grab the appropriate setup program for your system architecture from [cygwin.com/install.html](https://sourceware.org/cygwin/install.html) and run it. You'll be greeted by the standard setup welcome page, followed by a request for where to download packages from. You'll want to stick with the default "Install from Internet". Next your way through until you get a list of sources - you can pick any of them; preferably one closer to you. After downloading a list of packages, the setup maximizes to show you a full list of available packages:

[![Package list](http://sharedinstance.net/wp-content/uploads/2013/12/Screen-Shot-2013-12-19-at-1.12.51-am.png)](http://sharedinstance.net/wp-content/uploads/2013/12/Screen-Shot-2013-12-19-at-1.12.51-am.png)

Here's what you'll need to search for and install:

* git (under Devel)
* ca-certificates (under Net)
* make (under Devel)
* perl (under Perl)
* python (under Python)
* openssh (under Net)

Hit next two more times and let these packages, and the core Cygwin packages, install.

## Toolchain
If you allowed it, the setup program dropped a shortcut to Cygwin Terminal on your desktop and/or Start menu. (If not, you can manually launch C:\cygwin\bin\mintty.exe.) Launch either one and you'll be greeted with a command line (bash):

[![Cygwin terminal](http://sharedinstance.net/wp-content/uploads/2013/12/Screen-Shot-2013-12-19-at-1.27.03-am.png)](http://sharedinstance.net/wp-content/uploads/2013/12/Screen-Shot-2013-12-19-at-1.27.03-am.png)

<small>(I've customised mine - yours will have a different font and size.)</small>

From here, we'll create the directory where theos will live in, and clone it from coolstar's fork:

``` bash
mkdir -p /opt
cd /opt
git clone -b windows git://github.com/coolstar/theos.git
```

Next up is the toolchain itself, which will take a while...

``` bash
git clone -b x86_64 git://github.com/coolstar/iOSToolchain4Win.git theos/toolchain/windows/iphone
```

If your copy of Windows is not 64-bit, replace `x86_64` with `master`.

## SDK
Once that's done, you'll need to download an SDK. Legally, you can only do this by downloading an Xcode DMG image from Apple, so head to their [developer downloads page](https://developer.apple.com/downloads/index.action) (login required) and download an Xcode version of your choice - try Xcode 5 for the iOS 7 SDK and 4.6.3 for iOS 6.1. Meanwhile, you'll need to download and install [TransMac](http://www.acutesystems.com) so that you can extract files from the DMG.

Once the download is done, open the file. From there, click the DMG name in the sidebar, then navigate your way through to `Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs`. Right click `iPhoneOS6.1.sdk` and choose "Copy To".

[![Extracting SDK](http://sharedinstance.net/wp-content/uploads/2013/12/Screen-Shot-2013-12-24-at-6.53.11-pm.png)](http://sharedinstance.net/wp-content/uploads/2013/12/Screen-Shot-2013-12-24-at-6.53.11-pm.png)

<small>(I'm using Xcode 4.4.1, but the instructions will always be the same.)</small>

Here, you'll want to enter the path to Cygwin (unless you changed it, that's `C:\cygwin` on 32-bit Windows, or `C:\cygwin64` on 64-bit Windows), followed by the path to theos' SDK directory, and the directory name: `opt\theos\sdks\iPhoneOS6.1.sdk`. Hit OK and wait for the magic to happen.

## Try it out!
Everything should work as you expect it to now. Let's try building a test tweak. Before you do, though, you should add theos environment variables to your `.bash_profile` (or equivalent for your shell). Open `C:\cygwin\home\...username...\.bash_profile` in your favorite editor and add this on the very last line, replacing the device name with your own device's, replacing spaces with dashes, or its IP address:

``` bash
export THEOS=/opt/theos
export THEOS_DEVICE_IP=kirbpad.local THEOS_DEVICE_PORT=22
```

Load this into the shell with `. ~/.bash_profile`, or close the terminal window and launch a new one. `cd` to where you would like to store your theos projects (note that your C: drive lives at `/cygdrive/c` under Cygwin), or just create a new directory for that under your cygwin home directory:

``` bash
cd
mkdir projects
cd projects
```

Now run `$THEOS/bin/nic.pl` to summon the NIC. Select a tweak and provide the rest of the info. Now open Tweak.xm and paste in:

``` objc
%ctor {
	NSLog(@"It works!");
}
```

Get ready to [watch your syslog](http://gist.io/5128340), and run `make package install` inside the project directory. If all goes well, you'll see this somewhere among the other messages in the syslog:

``` plain
Dec 19 00:33:20 kirbpad SpringBoard[52026] <Notice>: MS:Notice: Loading: /Library/MobileSubstrate/DynamicLibraries/TestTweak.dylib
Dec 19 00:33:20 kirbpad SpringBoard[52026] <Warning>: It works!
```

Have fun - and don't forget to thank [coolstar](http://coolstar.org) for being awesome.
