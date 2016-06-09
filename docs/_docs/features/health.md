---
pageid: feature-health
title: Health Statistics
layout: docs
permalink: /docs/features/health-statistics/
---

Nuclide uses computing resources. We try to keep the resource usage as low as possible. One of the
features of Nuclide is a health monitor that allows you to track CPU, memory, heap usage and other
statistics.

![](/static/images/docs/feature-health-overview.png)

* TOC
{:toc}

## Toggling

The health statistics come up as a tabbed window in the
[main editor](/docs/editor/basics/#editing-area). To bring up this tab, you have four primary
options:

- `ctrl-option-shift-H` (`ctrl-alt-shift-H`)
- The [Nuclide toolbar](/docs/features/toolbar)
- The [command palette](/docs/editor/basics/#command-palette)

## Statistics

The following statistics are shown in the Nuclide health monitor. If you have multiple Nuclide
sessions open, the statistics are per that session, and not a combination of all sessions.

- **CPU**: How much CPU Nuclide is using.
- **Memory**: How much memory Nuclide is using.
- **Heap**: How much of the memory heap given to Node by V8 is being used by Nuclide.
- **Key Latency**: How much time between a key press and the event to occur within Nuclide.
- **Handles**: The number of active handles that still exist in Nuclide.
- **Event Loop**: How many pending requests that Nuclide has.

The last two statistics are reported by the underlying Atom renderer process and indicate how many
processes, handles, and outstanding activities are currently being managed by Node.

Also shown are the processes that have been spawned by Nuclide since it has been running, including
process id (pid), bytes received, sent and the number of errors from the process.

These statistics are provided by Node's [`process`](https://nodejs.org/api/process.html) APIs.
