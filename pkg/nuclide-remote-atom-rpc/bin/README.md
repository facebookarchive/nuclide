# Atom Command Service

This directory contains a tool, `atom-rpc`, that is used to communicate with Nuclide's Atom Command
Service. It is designed to be compatible with the ordinary `atom` command-line tool, but it
abstracts away whether Atom is running locally or remotely. Its primary use case is as a replacement
for the true `atom` command on remote machines where Atom is not installed, but where the Nuclide
server is used via the `nuclide` NPM module.

This document contains some tips for using this `atom-rpc` command in a way that falls back to a
local editor if the Atom Command Service is not running.

**Note:** All of the following scripts assume that you have a modern version of Node on your
`$PATH`. If this is not the case, then you will have to modify the sample Bash scripts to include
Node on the `$PATH` before shelling out to other commands.

## Recommended Usage

The general idea is to use the provided `atom` script to wrap `atom-rpc`, falling back to a local
editor if the Atom Command Service cannot be reached.

### Local Machine

If Atom and Nuclide are installed on your machine, then the path to the `atom` script that
wraps `atom-rpc` should be:

    $HOME/.atom/packages/nuclide/pkg/nuclide-remote-atom-rpc/bin/atom

You are free to use this script directly, but because you are likely to configure a number of other
tools to use `atom`, creating an extra level of indirection via the following Bash
script will make it easier to update later. Assuming you have a personal directory that is added to
your `$PATH`, such as `~/bin`, you should create an executable script at `~/bin/fast-open`:

```
#!/bin/bash

# Logic to locate the user's $HOME directory on either Linux or OS X
# that works as intended even when this script is run via `sudo`.
if [[ `uname` == 'Darwin' ]]; then
  BASE=/Users
else
  BASE=/home
fi
USER_HOME="$BASE/${SUDO_USER:-$USER}"

# If you are on OS X and would like to fall back on Sublime Text or TextMate if
# Atom is not already running, then create a wrapper script that checks for the
# presence of $ATOM_WAIT and then call `subl -w` or `mate -w`, as appropriate,
# if it is set. Specifying the path to this script as the value of
# $ATOM_BACKUP_EDITOR will take priority over $EDITOR in this case.
#
# We provide an example for Sublime Text, so if you want to use it as the
# fallback, uncomment the following line:
# export ATOM_BACKUP_EDITOR="$DEFAULT_ATOM_HOME/packages/nuclide/pkg/nuclide-remote-atom-rpc/bin/subl-fallback"

DEFAULT_ATOM_HOME="${USER_HOME}/.atom"
ATOM_HOME=${ATOM_HOME:-$DEFAULT_ATOM_HOME}
$DEFAULT_ATOM_HOME/packages/nuclide/pkg/nuclide-remote-atom-rpc/bin/atom "$@"
```

### Remote Machine

Find where you installed `Nuclide` via `npm` and find the path to
`node_modules/nuclide/pkg/nuclide-remote-atom-rpc/bin/atom` on your remote machine.
The equivalent to `~/bin/fast-open` on a remote machine is a trivial wrapper:

```
#!/bin/bash

<absolute-path-to-nuclide-remote-atom-rpc-bin-atom-on-your-remote-machine> "$@"
```

Because you are on a remote machine where there is nothing named `atom` on your `$PATH`,
it may make more sense to name `~/bin/fast-open` as `~/bin/atom` instead.

### Configuring `atom` for Use with Other Tools

Once you have `~/bin/fast-open` set up, run the following to make it the default editor for Git:

```
git config --global core.editor "${HOME}/bin/fast-open --wait"
```

If you use Phabricator, you may want to run the following to make it the default editor for
Arcanist:

```
arc set-config editor "${HOME}/bin/fast-open --wait"
```

Finally, there is no way to set the editor for `hg` from the command line, so you must edit your
`~/.hgrc` file manually. (Note that you should update the example to specify the absolute path to
`~/bin/fast-open` on your machine.)

```
[ui]
editor = <PATH_TO_YOUR_HOME_DIR>/bin/fast-open --wait
```
