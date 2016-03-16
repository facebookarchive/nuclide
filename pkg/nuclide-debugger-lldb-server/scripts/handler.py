# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

class HandlerParseError(Exception):
    pass

class UndefinedDomainError(Exception):
    pass

class UndefinedHandlerError(Exception):
    pass

class HandlerDomainSet(object):
    """
    Represents a set of HandlerDomains, and is able to call a handler using
    the handler's method name (ie 'Debugger.enable').
    """

    def __init__(self, *domains):
        super(HandlerDomainSet, self).__init__()
        # A map of Domain names to HandlerDomains.
        self._domains = {}
        self.register_domains(domains)

    def register_domains(self, domains):
        for domain in domains:
            assert domain.name not in self._domains, 'Domain %s is already defined.' % domain.name
            self._domains[domain.name] = domain

    def handle(self, method, params):
        domain_name = method_name = None

        try:
            domain_name, method_name = method.split('.')
        except ValueError:
            raise HandlerParseError(method)

        if domain_name in self._domains:
            return self._domains[domain_name].handle(method_name, params)
        else:
            raise UndefinedDomainError(method)


def handler():
    """
    Decorator that defines a handler using the name of the method to match
    up with the handler in the protocol.  Also enforces parameters and return type.
    """
    def register_wrapper(func):
        assert func.func_code.co_argcount == 2, 'Expected "%s" to have 2 args' % func.__name__

        def _handler_wrapper(self, params):
            ret = func(self, params)
            assert(type(ret) is dict)
            return ret
        _handler_wrapper._handler_name = func.__name__
        return _handler_wrapper

    return register_wrapper


class HandlerDomain(object):
    """
    An on object defining handlers for a given Chrome Dev Tools domain:

    Domains are defined in:
    https://developer.chrome.com/devtools/docs/protocol/1.1/index

    Params:
    debugger -- the associated SBDebugger instance.
    """

    def __init__(self, debugger_store):
        super(HandlerDomain, self).__init__()
        self._debugger_store = debugger_store
        self._handlers = self._discover_handlers()

    def _discover_handlers(self):
        """Finds @handler() functions and returns a mapping to them by name.
        """
        handlers = {}
        for value in [getattr(self, key) for key in dir(self)]:
            if not hasattr(value, '_handler_name'):
                continue
            name = value._handler_name
            assert(name not in handlers)
            handlers[name] = value
        return handlers

    @property
    def name(self):
        """
        The name of the Chrome Dev Tools domain this class represents
        """
        raise NotImplementedError('Handler domain name not defined')

    def handle(self, method, params):
        """
        Finds a method on this domain by name and calls it.
        """
        if method in self._handlers:
            return self._handlers[method](params)
        else:
            raise UndefinedHandlerError(method)

    @property
    def debugger_store(self):
        return self._debugger_store
