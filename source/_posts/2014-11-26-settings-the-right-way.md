---
layout: post
title: "Doing tweak settings the right way"
date: 2014-11-26 18:02:34 +1030
comments: true
categories: SBBlog
author: kirb
---

You might have noticed that tweak settings have suddenly started acting strange in iOS 8. This is because the `cfprefsd` concept from OS X (as long ago as in 10.8 Mountain Lion) has been brought across to iOS 8. When you change a setting now, the dictionary is no longer committed to disk immediately - rather, it's kept in memory by `cfprefsd` and only flushed to disk when the appropriate process (or `cfprefsd` itself) terminates. So with that in mind, how do you manage settings on iOS 8 now?

It's actually really simple and I'd argue a thousand times better than the hack all of us were using before this. First, you need to keep an instance of NSUserDefaults hanging around, and register your default preferences:

```objc
static NSString *const kHBCBPreferencesDomain = @"ws.hbang.cobalia";
static NSString *const kHBCBPreferencesEnabledKey = @"Enabled";
static NSString *const kHBCBPreferencesSwitchesKey = @"Switches";
static NSString *const kHBCBPreferencesSectionLabelKey = @"SectionLabel";
static NSString *const kHBCBPreferencesSwitchLabelsKey = @"SwitchLabels";

NSUserDefaults *userDefaults;

%init {
	userDefaults = [[NSUserDefaults alloc] _initWithSuiteName:kHBCBPreferencesDomain container:[NSURL URLWithString:@"/var/mobile"]];

	[userDefaults registerDefaults:@{
		kHBCBPreferencesEnabledKey: @YES,
		kHBCBPreferencesSwitchesKey: @[ /* ... */ ]
		kHBCBPreferencesSectionLabelKey: @YES,
		kHBCBPreferencesSwitchLabelsKey: @YES
	}]
}
```

You'll probably need to define this private init method in a category interface like so:

```objc
@interface NSUserDefaults (Private)

- (instancetype)_initWithSuiteName:(NSString *)suiteName container:(NSURL *)container;

@end
```

I use constants for strings that shouldn't ever change - you don't need to but I'd recommend it.

Now, it's as simple as a `[userDefaults boolForKey:@"Enabled"]` to grab a boolean, or `objectForKey:` for an Objective-C object, or any of the other methods [the class supports](https://developer.apple.com/Library/ios/documentation/Cocoa/Reference/Foundation/Classes/NSUserDefaults_Class/index.html).

Easy! If you notice, you don't even need to watch for a traditional Darwin notification, nor do you need to define `PostNotification` on your preferences specifiers. But what about libraries like AppList or Flipswitch that still write directly to the plist? The easiest thing you can do is a quick little trick to pass that back to `cfprefsd` to keep in memory. This is how I do it in [Cobalia](https://github.com/hbang/Cobalia/blob/master/Tweak.xm):

```objc
void HBCBPreferencesChanged() {
	NSDictionary *preferences = [NSDictionary dictionaryWithContentsOfFile:[[[NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES)[0] stringByAppendingPathComponent:@"Preferences"] stringByAppendingPathComponent:kHBCBPreferencesDomain] stringByAppendingPathExtension:@"plist"]];

	if (preferences[kHBCBPreferencesSwitchesKey]) {
		[userDefaults setObject:preferences[kHBCBPreferencesSwitchesKey] forKey:kHBCBPreferencesSwitchesKey];
	}
}

%ctor {
	HBCBPreferencesChanged();
	CFNotificationCenterAddObserver(CFNotificationCenterGetDarwinNotifyCenter(), NULL, (CFNotificationCallback)HBCBPreferencesChanged, CFSTR("ws.hbang.cobalia/ReloadPrefs"), NULL, kNilOptions);
}
```
