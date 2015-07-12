---
layout: post
title: "Important: Update your tweaks to support arm64"
date: 2013-12-24
categories: SBBlog
author: kirb
comments: true
---

The iPhone 5s, iPad Air and iPad mini (2nd generation) both run on a completely new processor architecture: arm64. If you haven't heard, this architecture is 64-bit, unlike the previous 32-bit architectures (armv6, armv7 and armv7s). Of course, these devices are still backwards compatible with the 32-bit architectures, but for 64-bit processes, **dynamic libraries not compiled for arm64 will not be loaded into them.**

However, updating your tweak to work on arm64 is fairly simple. It does come with one caveat, however: you are required to compile with the iOS 7.0 or newer SDK. If you're not using Xcode 5 or newer to compile your tweaks, you must do so in order to fully support these devices. 

Unfortunately, if you're not using the official toolchain (included with Xcode) to build your tweaks, it is currently not possible to support arm64, since Apple is yet to release the source code for the open-source tools included with the Xcode 5 toolchain.

Before you start, be sure to [update your code for arm64](https://developer.apple.com/library/ios/documentation/General/Conceptual/CocoaTouch64BitGuide/ConvertingYourAppto64-Bit/ConvertingYourAppto64-Bit.html). Please also remember that Substrate is currently not updated for arm64, so you may want to hold off on doing this if you don't have an arm64 device to test with.

## The easy way
<strong style="font-size: 1.05em;">(If you don't need to support iOS 4.2.1 or older)</strong>

The easiest way to fix this issue is simply to start using the iOS 7 SDK, and force theos to build your tweaks for both armv7 and arm64. If you have Xcode 5, you've most likely already completed the first part (if not, head to the App Store and update Xcode!). The second part is still fairly easy: open your project's makefile and add this line above the first `include`:

``` make
ARCHS = armv7 arm64
```

Finally, download [this build of the libsubstrate.dylib stub](http://cdn.hbang.ws/dl/libsubstrate_arm64.dylib) (contains armv6/armv7/armv7s/arm64 as well as i386 for OS X and x86_64 for iOS Simulator) and replace the existing file at $THEOS/lib/libsubstrate.dylib. That's it!

## The slightly more complex way
It may not be viable to compile only against the iOS 7 SDK, since that might mean dropping support for iOS versions before 4.3.  If you have a preference bundle, wee app, or anything else that is loaded into an arm64 process, don't forget that you'll need to perform the same thing to its binaries too. There are tons of goodies available on [the dev wiki](http://iphonedevwiki.net/index.php/Updating_extensions_for_iOS_7#Tweaks_that_do_need_iOS_4.2.1_and_below_compatibility) for this situation - and also has tips for issues that you may come across.
