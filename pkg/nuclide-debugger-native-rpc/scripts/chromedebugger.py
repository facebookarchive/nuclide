# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from threading import Thread
from ws4py.server.wsgirefserver import WSGIServer, WebSocketWSGIRequestHandler
from ws4py.server.wsgiutils import WebSocketWSGIApplication
from ws4py.websocket import WebSocket
from wsgiref.simple_server import make_server
import json
import sys
import traceback

from console_domain import ConsoleDomain
from debugger_domain import DebuggerDomain
from file_manager import FileManager
from handler import HandlerDomainSet, UndefinedDomainError, UndefinedHandlerError
from page_domain import PageDomain
from runtime_domain import RuntimeDomain
from logging_helper import log_debug, log_error


class DebuggerWebSocket(WebSocket):
    # List of HandlerDomainSets for the server to respond to reqs with.
    def __init__(self, *args, **kwargs):
        WebSocket.__init__(self, *args, **kwargs)
        self.debugger_store().chrome_channel.setSocket(self)

        common_domain_args = {
            'debugger_store': self.debugger_store()
        }

        runtime_domain = RuntimeDomain(**common_domain_args)
        debugger_domain = DebuggerDomain(
            runtime_domain,
            **common_domain_args)
        self.handlers = HandlerDomainSet(
            ConsoleDomain(**common_domain_args),
            debugger_domain,
            PageDomain(**common_domain_args),
            runtime_domain,
        )

    @staticmethod
    def debugger_store():
        """The ChromeDevToolsDebugger instance associated with this handler.
        """
        raise NotImplementedError()

    def _generate_response(self, message):
        response = {}
        try:
            response['id'] = message['id']
            response['result'] = self.handlers.handle(
                method=str(message['method']),
                params=message.get('params', {}),
            )
        except UndefinedDomainError as e:
            response['error'] = 'Undefined domain: %s' % str(e)
            response['result'] = {}
            log_debug('Received message with %s' % response['error'])
        except UndefinedHandlerError as e:
            response['error'] = 'Undefined handler: %s' % str(e)
            response['result'] = {}
            log_debug('Received message with %s' % response['error'])
        except Exception as e:
            response['error'] = repr(e)
            response['result'] = {}
            response['stack'] = traceback.format_exc()
            traceback.print_exc(file=sys.stderr)

        return response

    def received_message(self, message):

        parsed = None
        try:
            parsed = json.loads(message.data)
        except Exception:
            # Print invalid JSON requests to stderr.
            log_error('Invalid JSON: %s' % message)

        should_log = self._is_debugger_protocol(parsed)
        if should_log:
            log_debug('received_message: %s' % message.data)

        response = self._generate_response(parsed)
        response_in_json = json.dumps(response, ensure_ascii=False)
        if should_log:
            log_debug('response: %s' % response_in_json)
        self.send(response_in_json)

    def _is_debugger_protocol(self, parsed):
        return parsed is not None and (
            parsed['method'].startswith('Debugger') or
            parsed['method'].startswith('Runtime') or
            parsed['method'].startswith('Console'))


class ChromeDevToolsDebuggerApp(object):
    def __init__(self, debugger_store, port):
        class ConcreteDebuggerWebSocket(DebuggerWebSocket):
            @staticmethod
            def debugger_store():
                return debugger_store

        self.debug_server = make_server(
            'localhost',
            port,
            server_class=WSGIServer,
            handler_class=WebSocketWSGIRequestHandler,
            app=WebSocketWSGIApplication(handler_cls=ConcreteDebuggerWebSocket)
        )
        self.debug_server.initialize_websockets_manager()

    def start_blocking(self):
        self.debug_server.serve_forever()

    def start_nonblocking(self):
        thread = Thread(target=self.debug_server.serve_forever)
        thread.daemon = True
        thread.start()

    def shutdown(self):
        self.debug_server.shutdown()


def __lldb_init_module(debugger, internal_dict):
    # Print the server port on lldb import.
    app = ChromeDevToolsDebuggerApp(debugger)
    log_debug('chrome_debug(%s)' % app.debug_server.server_port)
    app.start_nonblocking()
