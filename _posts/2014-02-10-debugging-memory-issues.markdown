---
layout: post
title: "Debugging memory issues in Substrate tweaks"
date: 2014-02-10
categories: SBBlog
author: bensge
comments: true
---

Memory issues in MobileSubstrate tweaks are generally not very easy to debug. In the following text I’m explaining some useful tools for finding overreleases and leaks in your own tweaks.

One useful trick is to override `- (void)dealloc` in your subclasses and write a message to the syslog; that way you can make sure your objects are actually getting freed after usage. If dealloc is not getting called, you probably need to release that object once more. Keep in mind you should remove those logs for release builds of your tweaks. An easy way to do this is by adding this:

```objc
#ifndef DEBUG
#define NSLog
#endif
```

Recently Theos has changed from debug builds being optional by setting `DEBUG=1`, to them being the default. When you want to release your package, build it with `make package install FINALPACKAGE=1`, which also sets `DEBUG=0`. You can also turn off debug mode alone by passing `DEBUG=0`.

Another extremely useful trick if you experience crashes from use-after-free issues is to enable zombie objects. To enable those in any process you want (e.x. SpringBoard), ssh into your device, attach to the process with `cycript -p processname` first. Then declare _CFEnableZombies() in cycript like so: 

```js
extern "C" void _CFEnableZombies();
```

Now you can enable zombie objects simply by calling `_CFEnableZombies()`. Open up a syslog and keep and eye on it while the memory crash happens. You’ll see a message like this one:

```plain
<Error>: *** -[UIWindow methodSignatureForSelector:]: message sent to deallocated instance 0x162a7730`
```

There we go! Now just search for the (in this example) `methodSignatureForSelector:` in your code and fix the memory crash!

Happy debugging!

