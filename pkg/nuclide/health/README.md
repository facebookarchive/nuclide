# nuclide-health

This feature adds a simple status bar tile that shows CPU, memory, and heap usage, based on the
statistics surfaced from the node `process` and `os` APIs. The statistics shown are for Electron's
renderer process - those for the main process's usage are not included.
