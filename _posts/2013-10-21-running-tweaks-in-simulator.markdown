---
layout: post
title: "Running Substrate tweaks in the iOS Simulator"
date: 2013-10-21
categories: SBBlog
author: FTO and kirb
comments: true
---

With the iPhone 4 being the last iOS 7 device standing that can be jailbroken tethered, it's gotten much harder to test and update tweaks for the new firmware ahead of the untethered jailbreak release.

But there's still a way to do this if you're on a Mac. The iOS Simulator is basically already jailbroken, in the sense that you can access its filesystem and not all security policies are enforced. Therefore you can test your SpringBoard tweaks on iOS 7 with the simulator.

Do keep in mind that this will only work with tweaks that only need to load into SpringBoard or other daemons. If you want to test a tweak inside apps, unfortunately you'll need to wait for a proper Substrate for OS X release that can do this.

### Installing
First, you need to install Substrate. The binaries in the Substrate package in Cydia (except for MobileSafety) are compiled for both armv6 and i386/x86_64, so you can simply download, extract, and copy the files out of the package like so:

``` bash
wget http://apt.saurik.com/debs/mobilesubstrate_0.9.4001_iphoneos-arm.deb
mkdir substrate
dpkg-deb -x mobilesubstrate_0.9.4001_iphoneos-arm.deb substrate
sudo mv substrate/Library/Frameworks/CydiaSubstrate.framework /Library/Frameworks/CydiaSubstrate.framework
sudo mv substrate/Library/MobileSubstrate /Library/MobileSubstrate
sudo mv substrate/usr/lib/* /usr/lib
```

### Injecting
Awesome, now we need to get it to inject into the iOS Simulator. As of iOS 7, SpringBoard is launched by `launchd_sim` instead of directly by the simulator binary, so the hack that many people used in the past no longer works. However, you can still use Substrate by manually modifying LaunchDaemon plists found in the SDK.

Head over to the `LaunchDaemons` directory of the simulator's sysroot on your Mac:

```
/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator7.0.sdk/System/Library/LaunchDaemons
```

Make a backup of `com.apple.SpringBoard.plist` somewhere other than the LaunchDaemons directory (otherwise SpringBoard will be loaded twice).

Now open the original plist in your favorite text or plist editor (Xcode has one built in). It's a binary plist, so if your text editor isn't cool enough to convert it to XML automatically, you can do so with `plutil -convert xml1 com.apple.SpringBoard.plist`. Add an `EnvironmentVariables` key, and set its value to a dictionary containing `DYLD_INSERT_LIBRARIES`, and set the value of that to the location of your dylib (_not MobileSubstrate.dylib_).

You should end up with something like this:

![Modified com.apple.SpringBoard.plist](http://cdn.hbang.ws/sharedinstance/wp-content/uploads/2013/10/Screen-Shot-2013-10-20-at-9.58.32-PM-1.png)

If you have the simulator running, close and re-launch it for the changes to apply.

### Environment
Next, you must export `$IPHONE_SIMULATOR_ROOT`. Open `~/.bash_profile` (or the equivalent for your shell) and add:

``` bash
export IPHONE_SIMULATOR_ROOT=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator7.0.sdk
```

Load the changes into your shell by executing `. ~/.bash_profile`, or just close and launch a new shell.

Finally, you need to make a minor modification to theos, since the iOS 7 SDK's ld doesn't like one of the flags that theos passes to it. Open `$THEOS/makefiles/targets/Darwin/simulator.mk` in your editor, and find the following line:

``` make
_TARGET_OSX_VERSION_FLAG = -mmacosx-version-min=$(if $(_TARGET_VERSION_GE_4_0),10.6,10.5)
```

Replace it with this:

``` make
_TARGET_VERSION_GE_7_0 = $(call __simplify,_TARGET_VERSION_GE_7_0,$(shell $(THEOS_BIN_PATH)/vercmp.pl $(_THEOS_TARGET_SDK_VERSION) ge 7.0))
_TARGET_OSX_VERSION_FLAG = $(if $(_TARGET_VERSION_GE_7_0),-miphoneos-version-min=7.0,-mmacosx-version-min=$(if $(_TARGET_VERSION_GE_4_0),10.6,10.5))
```

### Linking
Your copy of `libsubstrate.dylib` won't be able to be linked against, since it doesn't have a slice for the iOS Simulator platform. You can download a version that does like so:

``` bash
mv $THEOS/lib/libsubstrate.dylib $THEOS/lib/libsubstrate.dylib_
wget http://cdn.hbang.ws/dl/libsubstrate_ios7sim.dylib -O $THEOS/lib/libsubstrate.dylib
```

Note that this only contains an x86_64 slice for OS X, since it isn't possible to have multiple i386 slices. However, you won't need to worry about this unless you have OS X projects that depend on OS X 10.5 or older.

### Compiling
Simply compiling tweaks like normal is not enough for them to work in the simulator: in this case, they'll be compiled for the ARM architecture, and your Mac runs on Intel. It's fairly simple to do this with theos, however, by setting the `TARGET` variable.

If you don't already have `TARGET` set in your makefile, at the top of your makefile, add this line:

``` make
TARGET = simulator
```

If you do, set the target parameter to `simulator`. For example:

``` make
TARGET = simulator:clang:7.0
```

<small>(Check out [theiostream's documentation on TARGET](https://github.com/theiostream/theos-ref/blob/master/2_1_1_5_0_TARGET.md) if you haven't tried it before.)</small>

### That's it!
You can now run make, ignoring the warning that ld whines about. SpringBoard will not be restarted for you, like usual – you must execute `killall SpringBoard` yourself.
