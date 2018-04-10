"""
Hinting the type using docstring of class/function.

It's an irreplaceable thing if you are using Dependency Injection with passive class:
http://www.martinfowler.com/articles/injection.html

Some code extracted (or based on code) from:
https://github.com/davidhalter/jedi/blob/b489019f5bd5750051122b94cc767df47751ecb7/jedi/evaluate/docstrings.py
Thanks to @davidhalter for this utils under MIT License.

Similar solutions:

    - https://www.jetbrains.com/pycharm/help/type-hinting-in-pycharm.html
    - https://www.python.org/dev/peps/pep-0484/#type-comments
    - http://www.pydev.org/manual_adv_type_hints.html
    - https://jedi.readthedocs.org/en/latest/docs/features.html#type-hinting

Discussions:

    - https://groups.google.com/d/topic/rope-dev/JlAzmZ83K1M/discussion
    - https://groups.google.com/d/topic/rope-dev/LCFNN98vckI/discussion

"""
import re
from ast import literal_eval

from rope.base.exceptions import AttributeNotFoundError
from rope.base.evaluate import ScopeNameFinder
from rope.base.pyobjects import PyClass, PyFunction

PEP0484_PATTERNS = [
    re.compile(r'type:\s*([^\n, ]+)'),
]

DOCSTRING_PARAM_PATTERNS = [
    r'\s*:type\s+%s:\s*([^\n, ]+)',  # Sphinx
    r'\s*:param\s+(\w+)\s+%s:[^\n]+',  # Sphinx param with type
    r'\s*@type\s+%s:\s*([^\n, ]+)',  # Epydoc
]

DOCSTRING_RETURN_PATTERNS = [
    re.compile(r'\s*:rtype:\s*([^\n, ]+)', re.M),  # Sphinx
    re.compile(r'\s*@rtype:\s*([^\n, ]+)', re.M),  # Epydoc
]

REST_ROLE_PATTERN = re.compile(r':[^`]+:`([^`]+)`')

try:
    from numpydoc.docscrape import NumpyDocString
except ImportError:
    def _search_param_in_numpydocstr(docstr, param_str):
        return []
else:
    def _search_param_in_numpydocstr(docstr, param_str):
        """Search `docstr` (in numpydoc format) for type(-s) of `param_str`."""
        params = NumpyDocString(docstr)._parsed_data['Parameters']
        for p_name, p_type, p_descr in params:
            if p_name == param_str:
                m = re.match('([^,]+(,[^,]+)*?)(,[ ]*optional)?$', p_type)
                if m:
                    p_type = m.group(1)

                if p_type.startswith('{'):
                    types = set(type(x).__name__ for x in literal_eval(p_type))
                    return list(types)
                else:
                    return [p_type]
        return []


def hint_pep0484(pyname):
    from rope.base.oi.soi import _get_lineno_for_node
    lineno = _get_lineno_for_node(pyname.assignments[0].ast_node)
    holding_scope = pyname.module.get_scope().get_inner_scope_for_line(lineno)
    line = holding_scope._get_global_scope()._scope_finder.lines.get_line(lineno)
    if '#' in line:
        type_strs = _search_type_in_pep0484(line.split('#', 1)[1])
        if type_strs:
            return _resolve_type(type_strs[0], holding_scope.pyobject)


def _search_type_in_pep0484(code):
    """ For more info see:
    https://www.python.org/dev/peps/pep-0484/#type-comments

    >>> _search_type_in_pep0484('type: int')
    ['int']
    """
    for p in PEP0484_PATTERNS:
        match = p.search(code)
        if match:
            return [match.group(1)]


def hint_param(pyfunc, param_name):
    type_strs = None
    func = pyfunc
    while not type_strs and func:
        if func.get_doc():
            type_strs = _search_param_in_docstr(func.get_doc(), param_name)
        func = _get_superfunc(func)

    if type_strs:
        return _resolve_type(type_strs[0], pyfunc)


def _get_superfunc(pyfunc):

    if not isinstance(pyfunc.parent, PyClass):
        return

    for cls in _get_mro(pyfunc.parent)[1:]:
        try:
            superfunc = cls.get_attribute(pyfunc.get_name()).get_object()
        except AttributeNotFoundError:
            pass
        else:
            if isinstance(superfunc, PyFunction):
                return superfunc


def _get_mro(pyclass):
    # FIXME: to use real mro() result
    l = [pyclass]
    for cls in l:
        for super_cls in cls.get_superclasses():
            if isinstance(super_cls, PyClass) and super_cls not in l:
                l.append(super_cls)
    return l


def _resolve_type(type_name, pyobj):
    type_ = None
    if '.' not in type_name:
        try:
            type_ = pyobj.get_module().get_scope().get_name(type_name).get_object()
        except Exception:
            pass
    else:
        mod_name, attr_name = type_name.rsplit('.', 1)
        try:
            mod_finder = ScopeNameFinder(pyobj.get_module())
            mod = mod_finder._find_module(mod_name).get_object()
            type_ = mod.get_attribute(attr_name).get_object()
        except Exception:
            pass
    return type_


def _search_param_in_docstr(docstr, param_str):
    """
    Search `docstr` for type(-s) of `param_str`.

    >>> _search_param_in_docstr(':type param: int', 'param')
    ['int']
    >>> _search_param_in_docstr('@type param: int', 'param')
    ['int']
    >>> _search_param_in_docstr(
    ...   ':type param: :class:`threading.Thread`', 'param')
    ['threading.Thread']
    >>> bool(_search_param_in_docstr('no document', 'param'))
    False
    >>> _search_param_in_docstr(':param int param: some description', 'param')
    ['int']

    """
    patterns = [re.compile(p % re.escape(param_str))
                for p in DOCSTRING_PARAM_PATTERNS]
    for pattern in patterns:
        match = pattern.search(docstr)
        if match:
            return [_strip_rst_role(match.group(1))]

    return (_search_param_in_numpydocstr(docstr, param_str) or
            [])


def _strip_rst_role(type_str):
    """
    Strip off the part looks like a ReST role in `type_str`.

    >>> _strip_rst_role(':class:`ClassName`')  # strip off :class:
    'ClassName'
    >>> _strip_rst_role(':py:obj:`module.Object`')  # works with domain
    'module.Object'
    >>> _strip_rst_role('ClassName')  # do nothing when not ReST role
    'ClassName'

    See also:
    http://sphinx-doc.org/domains.html#cross-referencing-python-objects

    """
    match = REST_ROLE_PATTERN.match(type_str)
    if match:
        return match.group(1)
    else:
        return type_str


def hint_return(pyfunc):
    type_str = None
    func = pyfunc
    while not type_str and func:
        if func.get_doc():
            type_str = _search_return_in_docstr(func.get_doc())
        func = _get_superfunc(func)
    if type_str:
        return _resolve_type(type_str, pyfunc)


def _search_return_in_docstr(code):
    for p in DOCSTRING_RETURN_PATTERNS:
        match = p.search(code)
        if match:
            return _strip_rst_role(match.group(1))


def hint_attr(pyclass, attr_name):
    type_strs = None
    for cls in _get_mro(pyclass):
        if cls.get_doc():
            type_strs = _search_param_in_docstr(cls.get_doc(), attr_name)
            if type_strs:
                break
    if type_strs:
        return _resolve_type(type_strs[0], pyclass)
