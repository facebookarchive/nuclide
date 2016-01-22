---
id: remote
title: Remote Development
layout: docs
permalink: /docs/remote/
---

![Nuclide connecting to a remote server](/static/images/docs/NuclideRemote.gif)

Nuclide publishes the
[`nuclide` NPM package](https://www.npmjs.com/package/nuclide), which creates
the bridge between your local client version of Nuclide and the development
machine on which you want to work. It has its own setup process that is outlined
below.

## Nuclide Server Setup

The following versions are required before installing the `nuclide` package:

+ Python 2.6 or later.
+ Node 0.12.0 or later.
+ `node`, and `npm` must be on your `$PATH`.
+ [Watchman](https://facebook.github.io/watchman). The Nuclide server
requires Watchman to detect file and directory changes. Follow the Watchman
[build or install instructions](http://facebook.github.io/watchman/docs/install.html#build-install)
for your server's platform.
+ SSH Daemon - The Nuclide client connects to the server via SSH, so
ensure that the server exposes an SSH daemon that you can connect to from your
client machine, and that you know the credentials required. You will need to
have an existing private key that can be used to connect to the server.
+ Port 9090-9093 exposed.  Note: you can specify another port in
**Remote Server Command**. See
["Connecting to your server from Nuclide"](#connecting-to-your-server-from-nuclide)
below.

### Installing via NPM

The easiest way to get the Nuclide server is from NPM:

```bash
npm install -g nuclide
```

We use the `-g` switch to ensure Nuclide is installed as a Node global package.

You do not need to explicitly start the server since the Nuclide client will
attempt to do so when it first connects over SSH.

### Troubleshooting Install

First verify that you are using the correct node version by running:

```bash
node --version
```

and verifying that you have version 0.12.0 or higher.

If you get EACCES errors when you try and npm install then you likely do not
have your NPM properly configured for installing global packages without root.
To fix this problem instead install in a directory your user owns like this:

```bash
npm config set prefix '~/.npm_packages'
```

and add

```bash
PATH=$PATH:$HOME/.npm_packages/bin; export PATH
```

to the end of your .profile.  Now you should be able to run:

```bash
npm install -g nuclide
```

without errors.

If you previously ran npm install as root you may need to correct the
permissions on your .npm directory by doing this:

```bash
sudo chown -R userid:userid .npm
```

where userid is your userid.  If you still get errors you may need to do this:

```bash
npm clear cache
```

## Connecting to your server from Nuclide

To connect to your server, go to the Packages menu in Atom and select the
'Connect...' option.

![](/static/images/docs/connect_menu.png)

You'll see the following dialog:

![Connect dialog](/static/images/docs/connect.png)

Note that all of the values shown above are examples and will vary based on
your own username, filesystem, and SSH and Nuclide configuration. The options
are as follows:

+ **Username** - the username that you would use to connect to your server
+ **Server** - the address of your server
+ **Initial Directory** - the path that you want to connect to initially on
your server
+ **SSH Port** - the port used to connect to your server (default is 22)
+ **Private Key** - the local path to your private SSH key for this server
(note: if your key is password protected you have to add it to ssh-agent and use
the ssh-agent-based authentication option)
+ **Use ssh-agent-based authentication** - the server will try and talk to ssh
agent.
+ **Password** - your password if you wish to use password authentication.
+ **Remote Server Command** - if you have correctly added the server script
to your path as described above, this should just be `nuclide-start-server`.
If not, you need to supply the full path to the location of this script. You
can either let the script pick an open port for you from a list of predefined
ports, or start the server on a specific port using the `-p` flag.
For example `nuclide-start-server -p 9099`

After supplying these options, click OK to connect.

This connection will then initiate the Nuclide server on the remote machine if
it is not yet running. The result will be that the root folder you just
specified will appear in the left-hand tree view, underneath any local folders
you might have had open:

![](/static/images/docs/tree_remote.png)

You can now use this tree to open and edit files as you would expect.
