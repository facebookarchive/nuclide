# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import bdb
import json
import socket
import sys

METHOD_CONNECT = 'connect'
METHOD_CONTINUE = 'continue'
METHOD_EXIT = 'exit'
METHOD_INIT = 'init'
METHOD_JUMP = 'jump'
METHOD_NEXT = 'next'
METHOD_QUIT = 'quit'
METHOD_RETURN = 'return'
METHOD_START = 'start'
METHOD_STEP = 'step'
METHOD_STOP = 'stop'


def debug(path_to_socket):
    '''Creates a new Debugger that will publish events to path_to_socket.

    Note that this debugger is only designed for single-threaded Python code
    right now. Check out threading.set_trace() and
    https://github.com/fabioz/PyDev.Debugger for a multi-threaded debugger.

    Args:
        path_to_socket (string): absolute path to .sock file
    Returns:
        Debugger once debugging has finished.
    '''
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    io = SocketIO(sock)
    sock.connect(path_to_socket)
    io.send({'method': METHOD_CONNECT})
    init_message = io.next()
    if init_message['method'] != METHOD_INIT:
        raise Exception('Received method other than init: ' + str(init_message))

    # We wait until we have the initial breakpoints before proceeding.
    debugger = Debugger(sock, io)
    for bp in init_message['breakpoints']:
        debugger.set_break(bp['file'], bp['line'])
    cmd = 'execfile(%r)' % sys.argv[0]
    debugger.run(cmd)
    return debugger


class SocketIO(bdb.Bdb):
    '''Reads and writes newline-delimited-JSON via a socket using blocking I/O.
    '''
    def __init__(self, sock):
        self._sock = sock
        self._data = ''

    def send(self, payload):
        '''
        Args:
            payload: Some sort of JSON-serializable object.
        '''
        self._sock.send(json.dumps(payload) + '\n')

    def next(self):
        '''Returns the next parsed JSON value.

        WARNING: This method is blocking.
        '''
        while True:
            index = self._data.find('\n')
            if index != -1:
                data = self._data[:index]
                out = json.loads(data)
                self._data = self._data[index + 1:]
                return out
            else:
                self._data += self._sock.recv(4096)


class Debugger(bdb.Bdb):
    def __init__(self, sock, io):
        '''Assumes sys.argv is in the proper state.
        '''
        bdb.Bdb.__init__(self)
        self._sock = sock
        self._io = io

    def run(self, cmd, globals=None, locals=None):
        bdb.Bdb.run(self, cmd, globals, locals)
        self._send_message({'method': METHOD_EXIT})
        self._sock.close()

    def user_line(self, frame):
        '''Override abstract method.

        One of self.stop_here(frame) or self.break_here(frame) is True.
        '''
        # If we are at a breakpoint, notify the client and block until we
        # are ready to yield control back to the running program.
        filename = frame.f_code.co_filename
        line = frame.f_lineno
        if filename == '<string>' and line == 1:
            # This is a special call that happens when the debugger starts that
            # gives clients a chance to perform any setup before continuing.
            self._send_message({
                'method': METHOD_START,
            })
        else:
            self._send_message({
                'method': METHOD_STOP,
                'file': filename,
                'line': line,
            })
        self._process_events_until_resume(frame, traceback=None)

    def _process_events_until_resume(self, frame, traceback):
        self.stack, self.curindex = self.get_stack(frame, traceback)
        self.curframe = self.stack[self.curindex][0]
        while True:
            message = self._io.next()
            method = message['method']
            if method == METHOD_CONTINUE:
                self.set_continue()
                return
            elif method == METHOD_NEXT:
                self.set_next(self.curframe)
                return
            elif method == METHOD_STEP:
                self.set_step()
                return
            elif method == METHOD_RETURN:
                self.set_return(self.curframe)
                return
            elif method == METHOD_JUMP:
                if self.curindex + 1 != len(self.stack):
                    # You can only jump within the bottom frame.
                    return
                line = message['line']
                self.curframe.f_lineno = line
                self.stack[self.curindex] = self.stack[self.curindex][0], line
                # self.print_stack_entry(self.stack[self.curindex])
                return
            elif method == METHOD_QUIT:
                self.set_quit()
                return

            # User may be trying to do something while the debugger is
            # suspended, such as setting or removing a breakpoint.
            # TODO(mbolin): Handle other events.
            pass

    def _send_message(self, payload):
        self._io.send(payload)
