---
id: platform-react-native
title: React Native
layout: docs
permalink: /docs/platforms/react-native/
---

Nuclide has built-in support for the [React Native](https://facebook.github.io/react-native/)
framework. React Native provides a set of components and extensions that allows you to easily write
native iOS and Android applications using the [Flow](/docs/languages/flow) and
[JavaScript](/docs/languages/other#javascript) programming languages and the
[React](http://facebook.github.io/react/) UI library.

* TOC
{:toc}

## Features

If your React Native apps are primarily written in [Flow](/docs/languages/flow), you get all of its
[features](/docs/languages/flow/#features) within Nuclide, including
[autocomplete](/docs/languages/flow/#autocomplete),
[code diagnostics](/docs/languages/flow/#features__code-diagnostics), etc.

![](/static/images/docs/platform-react-native-feature-autocomplete.png)

> [JavaScript](/docs/languages/other/#javascript) works well with Nuclide as well.

> You can also write [native iOS (Objective-C)](/docs/platforms/ios) with React Native, and get
> features such as automatic bracket completion from Nuclide when doing so. Native Android code
> written in conjunction with React Native has [minimal support](/docs/platforms/android).

## Running applications

Currently, the best way to run your React Native app during development is to run the React Native
Packager and Server from Nuclide and your application from the command line.

From the [command palette](/docs/editor/basics/#command-palette), choose
`Nuclide React Native: Start Packager`

![](/static/images/docs/platform-react-native-running-server-command.png)

![](/static/images/docs/platform-react-native-running-server.png)

Then at the command-line:

```bash
$ react-native run-ios
$ react-native run-android
```

> If you have built your React Native *iOS* application with Buck, you may be able to utilize the
> built-in [Nuclide Buck integration](/docs/platforms/ios) to build and run your application.

## Debugging

The [Nuclide debugger](/docs/features/debugger/#react-native) directly supports React Native for
iOS applications.

## Simulator Logs

Nuclide supports the [iOS emulator logs](/docs/platforms/ios#simulator-logs) and Android
[emulator logs](/docs/platforms/android#emulator-logs) directly within Nuclide.
