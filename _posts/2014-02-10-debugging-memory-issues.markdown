---
layout: post
title: "Debugging memory issues in Substrate tweaks"
date: 2014-02-10
categories: SBBlog
author: bensge
comments: true
---

Memory issues in MobileSubstrate tweaks are generally not very easy to debug. In the following text I'm explaining some useful tools for finding overreleases and leaks in your own tweaks.

One useful trick is to override `- (void)dealloc` in your subclasses and write a message to the syslog; that way you can make sure your objects are actually getting freed after usage. If dealloc is not getting called, you probably need to release that object once more. Keep in mind you should remove those logs for release builds of your tweaks. An easy way to do this is by adding this:

``` objc
#ifndef DEBUG
#define NSLog
#endif
```

On top of your tweaks makefile, add `DEBUG=1` to enable NSLogs, set it to zero or remove the line to disable all logs. You can also pass it to make at the command line, for instance: `make package install DEBUG=1`.

Another extremely useful trick if you experience crashes from use-after-free issues is to enable zombie objects. To enable those in any process you want (e.x. SpringBoard), ssh into your device, attach to the process with `cycript -p processname` first. Then declare _CFEnableZombies() in cycript like so: 

``` javascript
_CFEnableZombies = new Functor(dlsym(RTLD_DEFAULT, "_CFEnableZombies"), "v");
```

Now you can enable zombie objects simply by calling `_CFEnableZombies()`. Open up a syslog and keep and eye on it while the memory crash happens. You’ll see a message like this one:

``` plain
<Error>: *** -[UIWindow methodSignatureForSelector:]: message sent to deallocated instance 0x162a7730`
```

There we go! Now just search for the (in this example) `methodSignatureForSelector:` in your code and fix the memory crash!

Happy debugging!

