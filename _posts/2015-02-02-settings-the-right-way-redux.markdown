---
layout: post
title: "Doing tweak settings the right-er way"
date: 2015-02-15 18:50:56 +1030
comments: true
categories: SBBlog
author: kirb
---

As it turned out, retrieving tweak settings from `NSUserDefaults` as outlined in [the post I wrote](/2014/11/settings-the-right-way/) a few months ago proved to not be very robust and still had problems within a sandboxed process.

At one point several months prior to the [Cephei](https://hbang.github.io/libcephei/) update a few weeks ago, I thought about how preferences loading could be improved, and started working on a class called `HBPreferences`. The idea is that either you keep an instance of this class as a global variable in your tweak, and use it basically as you would with `NSUserDefaults`. Or, you can take it one step further than what `NSUserDefaults` is capable of and “register” a variable’s pointer so it’ll always be up to date with no preference reloading code required in your tweak.

If you don’t already understand the changes made in iOS 8, refer to the first few paragraphs of [the original post](/2014/11/settings-the-right-way/).

## Setting up Cephei with Theos
You won’t find Cephei in Cydia by searching for “Cephei” because it’s been set as hidden. However, you can install a package that depends on it like TypeStatus, or install “APT 0.7 Strict” (`apt7`) if you don’t already have it and run:

```bash
apt-get install ws.hbang.common
```

Now, open your project’s makefile and add:

```make
TargetName_EXTRA_FRAMEWORKS += Cephei
```

In your `control` file, add `ws.hbang.common` to your dependencies, and set it to require the latest version or newer. At the time of writing, that’s version 1.2, so for example:

```
Depends: mobilesubstrate, ws.hbang.common (>= 1.2)
```

## `NSUserDefaults` compatible method
This method has almost no changes from the example on the original post - just replace `NSUserDefaults` with `HBPreferences` and initialise with the `initWithIdentifier:` method like so:

```objc
static NSString *const kHBCBPreferencesDomain = @"ws.hbang.cobalia";
static NSString *const kHBCBPreferencesEnabledKey = @"Enabled";
static NSString *const kHBCBPreferencesSwitchesKey = @"Switches";
static NSString *const kHBCBPreferencesSectionLabelKey = @"SectionLabel";
static NSString *const kHBCBPreferencesSwitchLabelsKey = @"SwitchLabels";

HBPreferences *preferences;

%ctor {
	preferences = [[HBPreferences alloc] initWithIdentifier:kHBCBPreferencesDomain];

	[preferences registerDefaults:@{
		kHBCBPreferencesEnabledKey: @YES,
		kHBCBPreferencesSwitchesKey: @[ /* ... */ ],
		kHBCBPreferencesSectionLabelKey: @YES,
		kHBCBPreferencesSwitchLabelsKey: @YES
	}];
}
```

I use constants for strings that shouldn’t ever change - you don’t need to but I’d recommend it. If you prefer, you can also set keys on `preferences.defaults` directly, as it’s an `NSMutableDictionary`.

Once again, it’s as simple as `[preferences objectForKey:kHBCBPreferencesEnabledKey]` to get an Objective-C object (or nil if there’s no value and no default registered), or get a primitive directly using any of `bool`, `double`, `integer`, or `floatForKey:`. 

## Legacy library support
As mentioned in the previous post, at the time that [Cobalia](https://www.hbang.ws/tweaks/cobalia) was written, Flipswitch was not yet updated to support the new preferences system. Here is how it was fixed - by reading the plist from the disk and copying the data into the in-memory preferences cache:

```objc
void HBCBPreferencesChanged() {
	NSDictionary *plist = [NSDictionary dictionaryWithContentsOfFile:[[[NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES)[0] stringByAppendingPathComponent:@"Preferences"] stringByAppendingPathComponent:kHBCBPreferencesDomain] stringByAppendingPathExtension:@"plist"]];

	if (plist[kHBCBPreferencesSwitchesKey]) {
		[preferences setObject:plist[kHBCBPreferencesSwitchesKey] forKey:kHBCBPreferencesSwitchesKey];
	}
}

%ctor {
	HBCBPreferencesChanged();
	CFNotificationCenterAddObserver(CFNotificationCenterGetDarwinNotifyCenter(), NULL, (CFNotificationCallback)HBCBPreferencesChanged, CFSTR("ws.hbang.cobalia/ReloadPrefs"), NULL, kNilOptions);
}
```

Obviously you’ll also need to set the appropriate key in your preference specifiers for a Darwin notification to be posted with the name you provide.

## Variable registration
Finally, I want to explain the most powerful feature of `HBPreferences`: being able to “register” a variable so that its value is always kept up to date. This is quite easy to do:

```objc
BOOL enabled;
NSArray *switches;
BOOL sectionLabel, switchLabel;

%ctor {
	HBPreferences *preferences = [HBPreferences preferencesWithIdentifier:@"ws.hbang.cobalia"];

	[preferences registerBool:&enabled default:YES forKey:@"Enabled"];
	[preferences registerObject:&switches default:@[ /* ... */ ] forKey:@"Switches"];
	[preferences registerBool:&sectionLabel default:YES forKey:@"SectionLabel"];
	[preferences registerBool:&switchLabel default:YES forKey:@"SwitchLabels"];
}
```

In your preference specifiers, ensure you have the `PostNotification` key set to the identifier you pass in to `HBPreferences`, followed by `/ReloadPrefs`. For example:

```xml
<dict>
	<key>cell</key>
	<string>PSSwitchCell</string>
	<key>default</key>
	<true/>
	<key>defaults</key>
	<string>ws.hbang.cobalia</string>
	<key>key</key>
	<string>Enabled</string>
	<key>label</key>
	<string>Enabled</string>
	<key>PostNotification</key>
	<string>ws.hbang.cobalia/ReloadPrefs</string>
</dict>
```

And that’s it - now all you need to do is refer to these variables as you always would. You don’t need to worry at all about what happens when the user changes a setting; `HBPreferences` takes care of it for you and updates your variables.

If you want to learn more about what Cephei can do, take a look at [its documentation](https://hbang.github.io/libcephei/).
