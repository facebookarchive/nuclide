---
id: feature-debugger
title: Debugger
layout: docs
permalink: /docs/features/debugger/
---

One of the key features of Nuclide is its multiple-language debugging support. The Nuclide debugger
is provided within the familiar [Chrome DevTools](https://developer.chrome.com/devtools) interface.

The Nuclide debugger provides many capabilities allowing you to have a productive debug loop,
including inspection and watches, setting breakpoints, step in/over/out, etc.

## Instantiation

In general, the debugger is instantiated via `cmd-shift-Y` (`ctrl-shift-Y` on Linux). You can also
toggle the debugger through the [command palette](/docs/editor/basics/#command-palette) and the
Nuclide toolbar.

## Basics

Nuclide supports debugging for [multiple languages](#language-specific-debugging). However,
there are some basic debugging concepts that apply across all languages. Debugging a Node project
will be used to help illustrate the points described here.

### Debuggable Target

Specific details are provided for [each platform](#language-specific-debugging), but, in general,
to begin debugging code in Nuclide, you need to either launch a debug process from within Nuclide
(e.g., iOS from the Buck toolbar) or attach to a  currently running process (e.g., `node`) for
debugging.

*Example*

If you have a Node project running (e.g, via `npm start` or `node yourfile.js`), first press
`cmd-shift-Y` (`ctrl-shift-Y` on Linux) to toggle the debugger. Then, attach Nuclide to the
relevant `node` process. The number in `()` is the process id (pid).

![](/static/images/docs/feature-debugger-basics-target-process.png)

> If you have multiple processes running with the same name, you can use something similar to
> `ps aux | grep <process-name>` or Apple's Activity Monitor to find the process ID (pid) that
> matches with the process in the process list in Nuclide.

> If you stop your process and restart it again, make sure you press the `Refresh List` button since
> the pid will have changed.

Once you attach to a process, you may see a confirmation of the attachment on the command-line for
that process.

```bash
$ node read.js
Starting debugger agent.
Debugger listening on port 5858
```

After attaching to the process by pressing `Attach`, you should see the debugger UI showing you
both the main Debugger and `Console` tabs.

> The main debugging tab is titled `Sources`. However, since we don't display source code in this
> tab, it is currently a misnomer. We may retitle this to `Debugger` in the future.  

![](/static/images/docs/feature-debugger-basics-target-after-attach.png)

### Breakpoints

### Debugger

### Stepping

### Evaluation

## Language Specific Debugging

While the [general process](#basics) for debugging in Nuclide is similar, it is useful to discuss
and illustrate platform and language specific debugging workflows.

### PHP and Hack

### Node

### C++

### React Native

### iOS
