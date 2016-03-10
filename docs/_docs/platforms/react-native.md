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

### Buck Integration

> Buck Integration currently on works with React Native iOS apps. If you have an Android app, you
> can still use the
> [command-line](/docs/platforms/react-native/#running-applications__command-line) to run your
> application.

If you have built your React Native *iOS* application with Buck, you may be able to utilize the
built-in Nuclide Buck integration to build and run your application.

Bring up the [Buck build toolbar](/docs/features/toolbar/#buttons) from the Nuclide
[toolbar](/docs/features/toolbar/) or go to the command palette and serach for
`Nuclide Buck Toolbar: Toggle`.

![](/static/images/docs/platform-react-native-running-buck-toolbar.png)

In the Buck toolbar, enter a build target that you specified in your `.buckconfig` file. Nuclide
will search for targets for you and populate a list; autocomplete of your targets will occur as
you type.

After you enter a valid target, the `React Native Server Mode` checkbox will appear, allowing you,
when checked, to start the the React Native Server (i.e., Packager) when you run or debug your
application.

> There is currently a bug as to where you must have a project file open in order for the
> `React Native Server Mode` checkbox to appear.

Now you can click on `Build`, `Run` or `Debug`. `Build` will compile your Buck application.
`Run` will run your Buck application. And `Debug` will bring up the
[React Native debugger](/docs/features/debugger/#react-native).

If you had checked the `React Native Server Mode` box, the React Native Server will also appear
after pressing `Run` or `Debug`.

![](/static/images/docs/platform-react-native-running-server.png)

### Command-Line

If you are not using [Buck](#running-applications__buck-integration), you can still run your React
Native application during development. You run the React Native Packager and Server from Nuclide and
your application from the command line.

From the [command palette](/docs/editor/basics/#command-palette), choose
`Nuclide React Native: Start Packager`

![](/static/images/docs/platform-react-native-running-server-command.png)

This will bring up the React Native server.

Then at the command-line:

```bash
$ react-native run-ios
$ react-native run-android
```


## Debugging

The [Nuclide debugger](/docs/features/debugger/#react-native) directly supports React Native for
iOS applications.

## Simulator Logs

Nuclide supports the [iOS emulator logs](/docs/platforms/ios#simulator-logs) and Android
[emulator logs](/docs/platforms/android#emulator-logs) directly within Nuclide.
