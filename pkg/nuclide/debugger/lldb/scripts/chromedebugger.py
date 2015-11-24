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

from console import ConsoleDomain
from debugger import DebuggerDomain
from file_manager import FileManager
from handler import HandlerDomainSet, UndefinedDomainError, UndefinedHandlerError
from page_domain import PageDomain
from remote_objects import RemoteObjectManager
from runtime import RuntimeDomain
from logging_helper import log_debug, log_error


class DebuggerWebSocket(WebSocket):
    # List of HandlerDomainSets for the server to respond to reqs with.
    def __init__(self, *args, **kwargs):
        WebSocket.__init__(self, *args, **kwargs)
        common_domain_args = {
            'debugger': self.debugger(),
            'socket': self,
        }
        file_manager = FileManager(self)
        remote_object_manager = RemoteObjectManager()

        runtime_domain = RuntimeDomain(
            remote_object_manager,
            **common_domain_args)
        self.handlers = HandlerDomainSet(
            ConsoleDomain(**common_domain_args),
            DebuggerDomain(
                runtime_domain,
                file_manager,
                remote_object_manager,
                basepath=self.basepath(),
                **common_domain_args),
            PageDomain(**common_domain_args),
            runtime_domain,
        )

    @staticmethod
    def debugger():
        """The ChromeDevToolsDebugger instance associated with this handler.
        """
        raise NotImplementedError()

    @staticmethod
    def basepath():
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
        log_debug('received_message: %s' % message.data);
        parsed = None
        try:
            parsed = json.loads(message.data)
        except Exception:
            # Print invalid JSON requests to stderr.
            log_error('Invalid JSON: %s' % message)

        response = self._generate_response(parsed)
        response_in_json = json.dumps(response);
        log_debug('response: %s' % response_in_json);
        self.send(response_in_json)

    def send_notification(self, method, params=None):
        """ Send a notification over the socket to a Chrome Dev Tools client.
        """
        notification_in_json = json.dumps({'method': method, 'params': params});
        log_debug('send_notification: %s' % notification_in_json);
        self.send(notification_in_json)


class ChromeDevToolsDebuggerApp(object):
    def __init__(self, debugger, port, basepath='.'):
        class ConcreteDebuggerWebSocket(DebuggerWebSocket):
            @staticmethod
            def basepath():
                return basepath
            @staticmethod
            def debugger():
                return debugger

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


def __lldb_init_module(debugger, internal_dict):
    # Print the server port on lldb import.
    app = ChromeDevToolsDebuggerApp(debugger)
    log_debug('chrome_debug(%s)' % app.debug_server.server_port)
    app.start_nonblocking()
