# Remote Atom Commands

This package enables a command line utility on the nuclide server to invoke
commands on the connected Atom process.

On the server, the user can invoke `pkg/nuclide-remote-atom-rpc/bin/atom` to
invoke a command. Currently the only available command is to open files.

# Code Layout

## nuclide-remote-atom Package

This package runs in the Atom process.

## nuclide-remote-atom-rpc Package

This package contains all of the server side code.

### lib

The `lib` directory contains code which runs in the Nuclide Server process.

### bin

The `bin` directory contains the command line code.

### shared

The `shared` directory contains code which runs in both the Nuclide Server
 process and the command line process.

# Operation Order

## Initialization

- On Atom startup the nuclide-remote-atom package is initialized.
- When a ServerConnection is initialized, the nuclide-remote-atom package
  creates an instance of the `AtomCommands` interface and registers it
  with the nuclide-remote-atom-rpc package with `RemoteCommandService.registerAtomCommands`.
- Once the `AtomCommands` are registered the nuclide-remote-atom-rpc package
  begins listening for the `CommandService` RPC interface on a local socket.
- It writes a `ServerInfo` to a file in a well known location containing
  the socket port and family. Something like `~/.nuclide/command-server/1234/serverInfo.json`.

## Command Execution

On the server, the user can invoke `pkg/nuclide-remote-atom-rpc/bin/atom` to
invoke a command. That command does the following:

- Get the `ServerInfo` from the `serverInfo.json` file.
- Open an RPC connection using the `CommandService` service using the socket
  connection info from the `ServerInfo`.
- Retrieve the registered `AtomCommands` by calling `getAtomCommands()`.
- Invoke the command on the `AtomCommands` instance. Note that the AtomCommands
  instance is just the RPC proxy back to the original AtomCommands instance
  registered from the Atom process. So the command invocation proxies back to
  the Nuclide Server process which in turn proxies the call back to the Atom
  process. Command results get returned in reverse.
