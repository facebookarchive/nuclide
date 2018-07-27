HIGHLY EXPERIMENTAL, NO GUARANTEES

This is an experimental fuse wrapper for our Thrift FS service. It implements enough operations to demonstrate that file editing works in nano, emacs, vim and VS Code. There are, however, some performance issues that seem to occur with larger directories. I haven't spent much time troubleshooting those.

To make it work, you have to have fuse or some fuse-compatible API installed on your machine. I've only tested this with MacFuse, but according to the docs for the node-fuse bindings, it should work with Dokany, a fuse-compatible Windows library.

You'll also need to start up Nuclide and have the Remote FS running. Then you'll need to edit app-main.js with the port on which the remote FS is running.
