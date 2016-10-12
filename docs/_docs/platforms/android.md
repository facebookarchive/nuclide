---
pageid: platform-android
title: Android
layout: docs
permalink: /docs/platforms/android/
---

Nuclide's support for Android is currently much more basic and limited than that for
[iOS](/docs/platforms/ios). If you are a [React Native](/docs/platforms/react-native) developer for Android, there is more
full-featured support for the [Flow](/docs/languages/flow) or [JavaScript](/docs/languages/other/#javascript) side of your application. For debugging, there is
currently built-in support for [ADB logs](#emulator-logs).

> This section discusses primarily native Android development since there is a whole separate
> section dedicated to [React Native](/docs/platforms/react-native).

<br/>

* TOC
{:toc}

## Features

When you open an Android Java file (i.e., `.java`), you only get the basic syntax highlighting and
quick-completion capabilities given to you by Atom.

## Running Applications

Currently, the easiest way to build and run a native Android application is from an IDE such as
Android Studio. You can also use the command-line tools such as `adb`, `am`, etc.

## Debugging

Debugging Android applications is currently not supported except through the logs provided
by Nuclide's [Android Debug Bridge (ADB) Logcat support](#emulator-logs).

## Emulator Logs

When running your Android project in the Android emulator, you can open and view the emulator logs
directly within Nuclide. From the [Command Palette](/docs/editor/basics/#command-palette), search
for `Nuclide Adb Logcat: Start`.

![](/static/images/docs/platform-android-toggle-simulator.png)

![](/static/images/docs/platform-android-simulator-output.png)

> Currently, the logs are very verbose as they do not delineate between actual underlying emulator
> information with the actual running application.
