# nuclide-server

Provides a collection of services that are run on the Nuclide server to support
remote file editing.

This package runs as a Node package to provide the server-side functionality
required by Nuclide to support remote file editing.

## Nuclide Server Prerequisites

* **[Node](https://nodejs.org) v0.12.0 or greater**. There are various installer
and package options depending on your platform on the
[nodejs.org site](https://nodejs.org/download/).

* **[Watchman](https://facebook.github.io/watchman)**. The Nuclide server
requires Watchman to detect file and directory changes. You can build and/or
install Watchman for your server's platform as described
[here](http://facebook.github.io/watchman/docs/install.html#build-install).

* **SSH Daemon**. The Nuclide client connects to the server via SSH, so
ensure that the server exposes an SSH daemon that you can connect to from your
client machine, and that you know the credentials required.

## Installing Nuclide Server

Ensure that the Nuclide project is checked out onto the remote server. Run the
following command from the root of the repository to install Nuclide's server
dependencies:

```
./scripts/dev/setup --no-atom
```

Note that the `--no-atom` flag ensures that only Nuclide's Node packages are
installed on the server, and not those used by the Atom client itself.

## Running Nuclide Server

You do not need to explicitly start the server since the Nuclide client will
attempt to do so when it first connects over SSH. However, you will need to
specify the path of the startup script and provide it as part of the client's
'Connect...' dialog. This is found in the 'Packages' menu:

![Connect menu](http://nuclide.io/images/docs/connect_menu.png)

Therefore, ensure you know the path to the
`pkg/nuclide/server/start-nuclide-server` script and enter it into the 'Remote
Server Command' field at the bottom of the client's 'Connect...' dialog. After
providing your SSH credentials, submit the dialog to connect.

![Connect dialog](http://nuclide.io/images/docs/connect.png)

(Note that all of the values shown above are examples and will vary based on
your own username, filesystem, and SSH and Nuclide configuration.)

You can either let the script pick an open port for you from a list of predefined ports,
or start the server on a specific port using the `-p` flag.
For example:

```
[...]/start-nuclide-server -p 9099
```

This connection will then initiate the Nuclide server on the remote machine if
it is not yet running. The result will be that the root folder you just
specified will appear in the left-hand tree view, underneath any local folders
you might have had open:

![Tree view](http://nuclide.io/images/docs/tree_remote.png)

You can now use this tree to open and edit files as you would expect.

## Troubleshooting

If you want to debug the server starting up, you can of course run the command
directly:

```
./start-nuclide-server
```

A successful start will display the port upon which the server has started, and
a JSON dump of certificate information:

```
Nuclide started on port 9099.
{"workspace": null, "ca": "-----BEGIN CERTIFICATE-----\n...
```

The `start-nuclide-server` command also has a useful help option:

```
./start-nuclide-server -h
```

This explains many of the other options available, such as timeout, workspace
directory to use and so on.
