# Python debugger

This directory contains an implementation of a JavaScript API for a Python debugger.
The interface is asynchronous, and uses `Observable`s from [RxJS](http://reactivex.io/rxjs/) as its
primary form of communication.

Although this debugger is not as feature-rich as
[PyDev.Debugger](https://github.com/fabioz/PyDev.Debugger), the primary goal is to provide a Python
debugger that works both locally and remotely with Atom with minimal setup.

## Design

The Python debugger communicates with the JavaScript via a UNIX domain socket. The Python debugger
is written in pure Python 2, so it does not use any fancy async libraries. As such, it synchronously
writes to the socket when it has something to broadcast. It only performs blocking reads from the
socket when the debugger has reached a stopping point. This is by no means ideal, but it is a place
to start.

## Known Limitations

The Python logic is built on top of [`bdb.Bdb`](https://docs.python.org/2/library/bdb.html).
As it is currently implemented, it only supports debugging single-threaded Python programs.
