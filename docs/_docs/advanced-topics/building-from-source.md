---
id: advanced-building-from-source
title: Building Nuclide From Source
layout: docs
permalink: /docs/advanced-topics/building-from-source/
---

It is generally recommended to [install the released package of Nuclide](/docs/setup), but for
those willing to live on the bleeding edge, you can install Nuclide from source.

* TOC
{:toc}

## Mac

### Prerequisites

You must have the [general prerequisites](/docs/editor/setup#mac__prerequisites) installed. In
addition, you must have XCode and **Node 0.12.0** installed as well.

XCode can be installed from the App Store. Installation can take a *long, long* time. So be patient.

To install Node, the easiest way is to [download the latest released Node
package](https://nodejs.org) and go through the installer.

You can also install Node via [Homebrew](http://brew.sh/):

```bash
# Get homebrew if you don't have it.
$ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
# Check the versions of node that are available
$ brew search node
# Choose one that is 0.12.0 or greater
$ brew install homebrew/versions/node012
```

You can verify all the appropriate dependencies. All the following should be on your `$PATH`
(usually `usr/bin` or `usr/local/bin`).

```bash
$ git --version
git version 2.5.4 (Apple Git-61)
$ node --version
v4.2.5
$ npm --version
2.14.12
$ apm --version
apm  1.5.0
npm  2.13.3
node 0.10.40
python 2.7.10
git 2.5.4
```

Don't worry about the `apm` versions of `npm`, etc. Those are internal to `atom`. Used on your
system are the ones associated with `node --version`, etc.

### Building

Run the following commands to build Nuclide from source.

```bash
# Clone the source
$ git clone https://github.com/facebook/nuclide.git
$ cd nuclide
# Install dependencies
$ npm install
# Link the 'nuclide' package to Atom's package directory
$ apm link.
```

Verify the installation by:

1. Open Atom.
2. Go to `Atom | Preferences`.
3. Click on `Packages`.
4. Verify `nuclide` as one of the packages.

## Linux

### Prerequisites

You must have the [general prerequisites](/docs/editor/setup#linux__prerequisites) installed. In
addition, you must have **Node 0.12.0** installed as well.

Some flavors of Linux (e.g., Ubuntu 14.04) comes with versions of Node less than 0.12.0:

```bash
# Check current version of node
$ node --version
```

If not installed or < 0.12.0, check the versions of node that are available:

```bash
# Simulates an install
$ sudo apt-get -s install nodejs
```

If `nodejs` shows as >= 0.12.0, then:

```bash
$ sudo apt-get install nodejs
```

Otherwise, get a workable version of `nodejs`. There are two ways, neither of which is much easier
than the other.

You can [download the latest released Node package](https://nodejs.org) and then:

```bash
# The name of your tar file might be different. This will install node in /usr/local
$ sudo tar -C /usr/local --strip-components 1 -xzf node-v4.2.6-linux-x64.tar.gz
```

Or use a well-maintained [package manager](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions):

```bash
# If a version is installed`
$ sudo apt-get purge nodejs*
# If cURL is not installed
$ sudo apt-get install curl
# Now use nodesource to get the latest version
# If you really want 0.12, replace setup_4.x with setup_0.12
$ curl -sL https://deb.nodesource.com/setup_4.x | sudo bash -
$ sudo apt-get install -y nodejs
```

You can verify all the appropriate dependencies. All the following should be on your `$PATH`
(usually `usr/bin` or `usr/local/bin`).

```bash
$ git --version
git version 1.9.1
$ node --version
v4.2.6
$ npm --version
2.14.12
$ apm --version
apm  1.5.0
npm  2.13.3
node 0.10.40
python 2.7.6
git 1.9.1
```

Don't worry about the `apm` versions of `npm`, etc. Those are internal to `atom`. Used on your
system are the ones associated with `node --version`, etc.

### Building

Run the following commands to build Nuclide from source.

```bash
# Clone the source
$ git clone https://github.com/facebook/nuclide.git
$ cd nuclide
# Install dependencies
$ npm install
# Link the 'nuclide' package to Atom's package directory
$ apm link.
```

Verify the installation by:

1. Open Atom.
2. Go to `File | Preferences`.
3. Click on `Packages`.
4. Verify `nuclide` as one of the packages.

## Windows

Detailed Windows information coming soon.
