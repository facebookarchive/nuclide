"""
Implementations of standard library functions, because it's not possible to
understand them with Jedi.

To add a new implementation, create a function and add it to the
``_implemented`` dict at the bottom of this module.

Note that this module exists only to implement very specific functionality in
the standard library. The usual way to understand the standard library is the
compiled module that returns the types for C-builtins.
"""
import collections
import re

from jedi._compatibility import unicode
from jedi.common import unite
from jedi.evaluate import compiled
from jedi.evaluate import representation as er
from jedi.evaluate import iterable
from jedi.parser import ParserWithRecovery
from jedi.parser import tree
from jedi import debug
from jedi.evaluate import precedence
from jedi.evaluate import param
from jedi.evaluate import analysis


class NotInStdLib(LookupError):
    pass


def execute(evaluator, obj, arguments):
    try:
        obj_name = str(obj.name)
    except AttributeError:
        pass
    else:
        if obj.parent == evaluator.BUILTINS:
            module_name = 'builtins'
        elif isinstance(obj.parent, tree.Module):
            module_name = str(obj.parent.name)
        else:
            module_name = ''

        # for now we just support builtin functions.
        try:
            func = _implemented[module_name][obj_name]
        except KeyError:
            pass
        else:
            return func(evaluator, obj, arguments)
    raise NotInStdLib()


def _follow_param(evaluator, arguments, index):
    try:
        key, values = list(arguments.unpack())[index]
    except IndexError:
        return set()
    else:
        return unite(evaluator.eval_element(v) for v in values)


def argument_clinic(string, want_obj=False, want_scope=False, want_arguments=False):
    """
    Works like Argument Clinic (PEP 436), to validate function params.
    """
    clinic_args = []
    allow_kwargs = False
    optional = False
    while string:
        # Optional arguments have to begin with a bracket. And should always be
        # at the end of the arguments. This is therefore not a proper argument
        # clinic implementation. `range()` for exmple allows an optional start
        # value at the beginning.
        match = re.match('(?:(?:(\[),? ?|, ?|)(\w+)|, ?/)\]*', string)
        string = string[len(match.group(0)):]
        if not match.group(2):  # A slash -> allow named arguments
            allow_kwargs = True
            continue
        optional = optional or bool(match.group(1))
        word = match.group(2)
        clinic_args.append((word, optional, allow_kwargs))

    def f(func):
        def wrapper(evaluator, obj, arguments):
            debug.dbg('builtin start %s' % obj, color='MAGENTA')
            try:
                lst = list(arguments.eval_argument_clinic(clinic_args))
            except ValueError:
                return set()
            else:
                kwargs = {}
                if want_scope:
                    kwargs['scope'] = arguments.scope()
                if want_obj:
                    kwargs['obj'] = obj
                if want_arguments:
                    kwargs['arguments'] = arguments
                return func(evaluator, *lst, **kwargs)
            finally:
                debug.dbg('builtin end', color='MAGENTA')

        return wrapper
    return f


@argument_clinic('object, name[, default], /')
def builtins_getattr(evaluator, objects, names, defaults=None):
    # follow the first param
    for obj in objects:
        if not isinstance(obj, (er.Instance, er.Class, tree.Module, compiled.CompiledObject)):
            debug.warning('getattr called without instance')
            continue

        for name in names:
            if precedence.is_string(name):
                return evaluator.find_types(obj, name.obj)
            else:
                debug.warning('getattr called without str')
                continue
    return set()


@argument_clinic('object[, bases, dict], /')
def builtins_type(evaluator, objects, bases, dicts):
    if bases or dicts:
        # It's a type creation... maybe someday...
        return set()
    else:
        return set([o.py__class__() for o in objects])


class SuperInstance(er.Instance):
    """To be used like the object ``super`` returns."""
    def __init__(self, evaluator, cls):
        su = cls.py_mro()[1]
        super().__init__(evaluator, su and su[0] or self)


@argument_clinic('[type[, obj]], /', want_scope=True)
def builtins_super(evaluator, types, objects, scope):
    # TODO make this able to detect multiple inheritance super
    accept = (tree.Function, er.FunctionExecution)
    if scope.isinstance(*accept):
        wanted = (tree.Class, er.Instance)
        cls = scope.get_parent_until(accept + wanted,
                                     include_current=False)
        if isinstance(cls, wanted):
            if isinstance(cls, tree.Class):
                cls = er.Class(evaluator, cls)
            elif isinstance(cls, er.Instance):
                cls = cls.base
            su = cls.py__bases__()
            if su:
                return evaluator.execute(su[0])
    return set()


@argument_clinic('sequence, /', want_obj=True, want_arguments=True)
def builtins_reversed(evaluator, sequences, obj, arguments):
    # While we could do without this variable (just by using sequences), we
    # want static analysis to work well. Therefore we need to generated the
    # values again.
    first_arg = next(arguments.as_tuple())[0]
    ordered = list(iterable.py__iter__(evaluator, sequences, first_arg))

    rev = [iterable.AlreadyEvaluated(o) for o in reversed(ordered)]
    # Repack iterator values and then run it the normal way. This is
    # necessary, because `reversed` is a function and autocompletion
    # would fail in certain cases like `reversed(x).__iter__` if we
    # just returned the result directly.
    rev = iterable.AlreadyEvaluated(
        [iterable.FakeSequence(evaluator, rev, 'list')]
    )
    return set([er.Instance(evaluator, obj, param.Arguments(evaluator, [rev]))])


@argument_clinic('obj, type, /', want_arguments=True)
def builtins_isinstance(evaluator, objects, types, arguments):
    bool_results = set([])
    for o in objects:
        try:
            mro_func = o.py__class__().py__mro__
        except AttributeError:
            # This is temporary. Everything should have a class attribute in
            # Python?! Maybe we'll leave it here, because some numpy objects or
            # whatever might not.
            return set([compiled.create(True), compiled.create(False)])

        mro = mro_func()

        for cls_or_tup in types:
            if cls_or_tup.is_class():
                bool_results.add(cls_or_tup in mro)
            elif str(cls_or_tup.name) == 'tuple' \
                    and cls_or_tup.get_parent_scope() == evaluator.BUILTINS:
                # Check for tuples.
                classes = unite(cls_or_tup.py__iter__())
                bool_results.add(any(cls in mro for cls in classes))
            else:
                _, nodes = list(arguments.unpack())[1]
                for node in nodes:
                    message = 'TypeError: isinstance() arg 2 must be a ' \
                              'class, type, or tuple of classes and types, ' \
                              'not %s.' % cls_or_tup
                    analysis.add(evaluator, 'type-error-isinstance', node, message)

    return set(compiled.create(evaluator, x) for x in bool_results)


def collections_namedtuple(evaluator, obj, arguments):
    """
    Implementation of the namedtuple function.

    This has to be done by processing the namedtuple class template and
    evaluating the result.

    .. note:: |jedi| only supports namedtuples on Python >2.6.

    """
    # Namedtuples are not supported on Python 2.6
    if not hasattr(collections, '_class_template'):
        return set()

    # Process arguments
    # TODO here we only use one of the types, we should use all.
    name = list(_follow_param(evaluator, arguments, 0))[0].obj
    _fields = list(_follow_param(evaluator, arguments, 1))[0]
    if isinstance(_fields, compiled.CompiledObject):
        fields = _fields.obj.replace(',', ' ').split()
    elif isinstance(_fields, iterable.Array):
        try:
            fields = [v.obj for v in unite(_fields.py__iter__())]
        except AttributeError:
            return set()
    else:
        return set()

    # Build source
    source = collections._class_template.format(
        typename=name,
        field_names=fields,
        num_fields=len(fields),
        arg_list=', '.join(fields),
        repr_fmt=', '.join(collections._repr_template.format(name=name) for name in fields),
        field_defs='\n'.join(collections._field_template.format(index=index, name=name)
                             for index, name in enumerate(fields))
    )

    # Parse source
    generated_class = ParserWithRecovery(evaluator.grammar, unicode(source)).module.subscopes[0]
    return set([er.Class(evaluator, generated_class)])


@argument_clinic('first, /')
def _return_first_param(evaluator, firsts):
    return firsts


_implemented = {
    'builtins': {
        'getattr': builtins_getattr,
        'type': builtins_type,
        'super': builtins_super,
        'reversed': builtins_reversed,
        'isinstance': builtins_isinstance,
    },
    'copy': {
        'copy': _return_first_param,
        'deepcopy': _return_first_param,
    },
    'json': {
        'load': lambda *args: set(),
        'loads': lambda *args: set(),
    },
    'collections': {
        'namedtuple': collections_namedtuple,
    },
}
