"""
One of the really important features of |jedi| is to have an option to
understand code like this::

    def foo(bar):
        bar. # completion here
    foo(1)

There's no doubt wheter bar is an ``int`` or not, but if there's also a call
like ``foo('str')``, what would happen? Well, we'll just show both. Because
that's what a human would expect.

It works as follows:

- |Jedi| sees a param
- search for function calls named ``foo``
- execute these calls and check the input. This work with a ``ParamListener``.
"""
from itertools import chain

from jedi._compatibility import unicode
from jedi.parser import tree
from jedi import settings
from jedi import debug
from jedi.evaluate.cache import memoize_default
from jedi.evaluate import imports


MAX_PARAM_SEARCHES = 20


class ParamListener(object):
    """
    This listener is used to get the params for a function.
    """
    def __init__(self):
        self.param_possibilities = []

    def execute(self, params):
        self.param_possibilities += params


@debug.increase_indent
def search_params(evaluator, param):
    """
    A dynamic search for param values. If you try to complete a type:

    >>> def func(foo):
    ...     foo
    >>> func(1)
    >>> func("")

    It is not known what the type ``foo`` without analysing the whole code. You
    have to look for all calls to ``func`` to find out what ``foo`` possibly
    is.
    """
    if not settings.dynamic_params:
        return set()

    evaluator.dynamic_params_depth += 1
    try:
        func = param.get_parent_until(tree.Function)
        debug.dbg('Dynamic param search for %s in %s.', param, str(func.name), color='MAGENTA')
        # Compare the param names.
        names = [n for n in search_function_call(evaluator, func)
                 if n.value == param.name.value]
        # Evaluate the ExecutedParams to types.
        result = set(chain.from_iterable(n.parent.eval(evaluator) for n in names))
        debug.dbg('Dynamic param result %s', result, color='MAGENTA')
        return result
    finally:
        evaluator.dynamic_params_depth -= 1


@memoize_default([], evaluator_is_first_arg=True)
def search_function_call(evaluator, func):
    """
    Returns a list of param names.
    """
    from jedi.evaluate import representation as er

    def get_possible_nodes(module, func_name):
            try:
                names = module.used_names[func_name]
            except KeyError:
                return

            for name in names:
                bracket = name.get_next_leaf()
                trailer = bracket.parent
                if trailer.type == 'trailer' and bracket == '(':
                    yield name, trailer

    def undecorate(typ):
        # We have to remove decorators, because they are not the
        # "original" functions, this way we can easily compare.
        # At the same time we also have to remove InstanceElements.
        if typ.isinstance(er.Function, er.Instance) \
                and typ.decorates is not None:
            return typ.decorates
        elif isinstance(typ, er.InstanceElement):
            return typ.var
        else:
            return typ

    current_module = func.get_parent_until()
    func_name = unicode(func.name)
    compare = func
    if func_name == '__init__':
        cls = func.get_parent_scope()
        if isinstance(cls, tree.Class):
            func_name = unicode(cls.name)
            compare = cls

    # add the listener
    listener = ParamListener()
    func.listeners.add(listener)

    try:
        result = []
        i = 0
        for mod in imports.get_modules_containing_name(evaluator, [current_module], func_name):
            for name, trailer in get_possible_nodes(mod, func_name):
                i += 1

                # This is a simple way to stop Jedi's dynamic param recursion
                # from going wild: The deeper Jedi's in the recursin, the less
                # code should be evaluated.
                if i * evaluator.dynamic_params_depth > MAX_PARAM_SEARCHES:
                    return listener.param_possibilities

                for typ in evaluator.goto_definitions(name):
                    undecorated = undecorate(typ)
                    if evaluator.wrap(compare) == undecorated:
                        # Only if we have the correct function we execute
                        # it, otherwise just ignore it.
                        evaluator.eval_trailer([typ], trailer)

            result = listener.param_possibilities

            # If there are results after processing a module, we're probably
            # good to process.
            if result:
                return result
    finally:
        # cleanup: remove the listener; important: should not stick.
        func.listeners.remove(listener)

    return set()
