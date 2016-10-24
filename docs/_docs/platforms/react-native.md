---
pageid: platform-react-native
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
[Autocomplete](/docs/languages/flow/#autocomplete),
[Code Diagnostics](/docs/languages/flow/#features__code-diagnostics), etc.

![](/static/images/docs/platform-react-native-feature-autocomplete.png)

> [JavaScript](/docs/languages/other/#javascript) works well with Nuclide as well.

> You can also write [native iOS (Objective-C)](/docs/platforms/ios) code with React Native, and get
> features such as [Automatic Square Bracket Completion](/docs/languages/objective-c/#default-features__automatic-square-bracket-completion) from Nuclide when doing so. Native Android code written in conjunction with React Native has [minimal support](/docs/platforms/android).

## Running applications

All React Native features are currently available from the [Command Palette](/docs/editor/basics/#command-palette).

![](/static/images/docs/platform-react-native-debugging-command-palette.png)

You run the React Native Packager and Server from Nuclide and your application from the command line.

### React Native Packager

From the [Command Palette](/docs/editor/basics/#command-palette), choose `Nuclide React Native: Start Packager` to start the React Native Server. The output in the [Console](/docs/features/debugger/#basics__evaluation) panel indicates if the React Native Packager started or if it encountered any errors.

![](/static/images/docs/platform-react-native-start-packager.png)

The server runs on the default `port 8081`. You can stop and restart the server at anytime.

### Command Line

Ensure that you are in the root directory of the React Native project, then run the application from the command-line:

```bash
$ react-native run-ios
$ react-native run-android
```

This should bring up the Simulator with your running application inside.

## Debugging

[React Native](https://facebook.github.io/react-native/) for [iOS](/docs/platforms/ios) has
first-class support within Nuclide. The Debugger is no exception.

> Debugging React Native for Android is currently not supported except for the
> [Simulator logs](#simulator-logs).

From Nuclide, you can start a React Native development server, inspect React Native elements and
use the [Debugger](/docs/features/debugger#basics) to set and stop on breakpoints, etc.

> In order to use React Native within Nuclide, you must
> [install](https://facebook.github.io/react-native/docs/getting-started.html) it.

### Loading a React Native Project

You open a React Native project the
[usual way](/docs/quick-start/getting-started/#adding-a-project). Nuclide will automatically
establish that you have a React Native project by seeing the `node_modules/react-native` directory
from the root of your project.

### React Native Server

Before starting the Debugger, [launch the React Native Server from within Nuclide](#running-applications__react-native-packager).

### Prime the Debugger

After starting the server, you can prime the React Native Debugger for when the application begins
running. From the [Command Palette](/docs/editor/basics/#command-palette), launch
`Nuclide React Native: Start Debugging`.

You might see that the Nuclide Debugger UI appears but doesn't start, instead showing you a waiting condition.

<img src="/static/images/docs/platform-react-native-debugger-waititng.png" align="middle" style="width:500px" />

This means that the Debugger is waiting to attach to the actual running process of the React
Native application.

### Run the React Native Application

[Start your React Native application from the command-line](#running-applications__command-line).

### Enable Debugging from the Application

From the Simulator, you will want to enable debugging the application. Press `Cmd-D` (`Ctrl-D` on
Linux). This will bring up the debug options for your application. Select **Debug JS Remotely**.

![](/static/images/docs/platform-react-native-debug-options.png)

> If you have enabled debugging in a previous session, then debugging will still be enabled; thus,
> this step will not be necessary.

### Start Debugging

After you enable debugging from the simulated application, Nuclide will attach to that debugging
process automatically, since we primed the Debugger above. You can now set breakpoints, Watch Expressions,
etc.

> You can set breakpoints, Watch Expressions, etc. earlier than this step, but access to them will not be
> available until the debugging has been enabled.

> If the Debugger is paused when it opens, you may have to click the resume execution button
> (i.e., the play icon) for debugging to begin.

Now you can start debugging your React Native application as [normal](/docs/features/debugger#basics).

![](/static/images/docs/platform-react-native-debugging.png)

### Element Inspector

The React Native Debugger in Nuclide also provides an Element Inspector, where you can view and
toggle properties of your application.

From the [Command Palette](/docs/editor/basics/#command-palette), choose `Nuclide React Native Inspector: Show` to open the **React Native Inspector** tab in the
main [Editing Area](/docs/editor/basics/#editing-area).

![](/static/images/docs/platform-react-native-element-inspector.png)

To see the actual elements highlighted in the Nuclide Element Inspector also highlighted in the
Simulator, you must enable the Simulator Inspector as well. Press `Cmd-D` (`Ctrl-D` on Linux) within
the Simulator and choose **Show Inspector**.

![](/static/images/docs/platform-react-native-show-inspector.png)

## Simulator Logs

Nuclide supports the [iOS Simulator logs](/docs/platforms/ios#simulator-logs) and
[Android Emulator logs](/docs/platforms/android#emulator-logs) directly within Nuclide.
