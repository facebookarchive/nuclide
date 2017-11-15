"""
The ``Parser`` tries to convert the available Python code in an easy to read
format, something like an abstract syntax tree. The classes who represent this
tree, are sitting in the :mod:`jedi.parser.tree` module.

The Python module ``tokenize`` is a very important part in the ``Parser``,
because it splits the code into different words (tokens).  Sometimes it looks a
bit messy. Sorry for that! You might ask now: "Why didn't you use the ``ast``
module for this? Well, ``ast`` does a very good job understanding proper Python
code, but fails to work as soon as there's a single line of broken code.

There's one important optimization that needs to be known: Statements are not
being parsed completely. ``Statement`` is just a representation of the tokens
within the statement. This lowers memory usage and cpu time and reduces the
complexity of the ``Parser`` (there's another parser sitting inside
``Statement``, which produces ``Array`` and ``Call``).
"""
import os
import re

from jedi.parser import tree as pt
from jedi.parser import tokenize
from jedi.parser.token import (DEDENT, INDENT, ENDMARKER, NEWLINE, NUMBER,
                               STRING)
from jedi.parser.pgen2.pgen import generate_grammar
from jedi.parser.pgen2.parse import PgenParser

OPERATOR_KEYWORDS = 'and', 'for', 'if', 'else', 'in', 'is', 'lambda', 'not', 'or'
# Not used yet. In the future I intend to add something like KeywordStatement
STATEMENT_KEYWORDS = 'assert', 'del', 'global', 'nonlocal', 'raise', \
    'return', 'yield', 'pass', 'continue', 'break'


_loaded_grammars = {}


class ParseError(Exception):
    """
    Signals you that the code you fed the Parser was not correct Python code.
    """


def load_grammar(version='3.4'):
    # For now we only support two different Python syntax versions: The latest
    # Python 3 and Python 2. This may change.
    if version in ('3.2', '3.3'):
        version = '3.4'
    elif version == '2.6':
        version = '2.7'

    file = 'grammar' + version + '.txt'

    global _loaded_grammars
    path = os.path.join(os.path.dirname(__file__), file)
    try:
        return _loaded_grammars[path]
    except KeyError:
        return _loaded_grammars.setdefault(path, generate_grammar(path))


class ParserSyntaxError(object):
    def __init__(self, message, position):
        self.message = message
        self.position = position


class Parser(object):
    AST_MAPPING = {
        'expr_stmt': pt.ExprStmt,
        'classdef': pt.Class,
        'funcdef': pt.Function,
        'file_input': pt.Module,
        'import_name': pt.ImportName,
        'import_from': pt.ImportFrom,
        'break_stmt': pt.KeywordStatement,
        'continue_stmt': pt.KeywordStatement,
        'return_stmt': pt.ReturnStmt,
        'raise_stmt': pt.KeywordStatement,
        'yield_expr': pt.YieldExpr,
        'del_stmt': pt.KeywordStatement,
        'pass_stmt': pt.KeywordStatement,
        'global_stmt': pt.GlobalStmt,
        'nonlocal_stmt': pt.KeywordStatement,
        'print_stmt': pt.KeywordStatement,
        'assert_stmt': pt.AssertStmt,
        'if_stmt': pt.IfStmt,
        'with_stmt': pt.WithStmt,
        'for_stmt': pt.ForStmt,
        'while_stmt': pt.WhileStmt,
        'try_stmt': pt.TryStmt,
        'comp_for': pt.CompFor,
        'decorator': pt.Decorator,
        'lambdef': pt.Lambda,
        'old_lambdef': pt.Lambda,
        'lambdef_nocond': pt.Lambda,
    }

    def __init__(self, grammar, source, start_symbol='file_input',
                 tokenizer=None, start_parsing=True):
        # Todo Remove start_parsing (with False)

        self._used_names = {}
        self._scope_names_stack = [{}]
        self._last_failed_start_pos = (0, 0)
        self._global_names = []

        # For the fast parser.
        self.position_modifier = pt.PositionModifier()

        self._added_newline = False
        # The Python grammar needs a newline at the end of each statement.
        if not source.endswith('\n') and start_symbol == 'file_input':
            source += '\n'
            self._added_newline = True

        self.source = source
        self._start_symbol = start_symbol
        self._grammar = grammar

        self._parsed = None

        if start_parsing:
            if tokenizer is None:
                tokenizer = tokenize.source_tokens(source, use_exact_op_types=True)
            self.parse(tokenizer)

    def parse(self, tokenizer):
        if self._parsed is not None:
            return self._parsed

        start_number = self._grammar.symbol2number[self._start_symbol]
        pgen_parser = PgenParser(
            self._grammar, self.convert_node, self.convert_leaf,
            self.error_recovery, start_number
        )

        try:
            self._parsed = pgen_parser.parse(tokenizer)
        finally:
            self.stack = pgen_parser.stack

        if self._start_symbol == 'file_input' != self._parsed.type:
            # If there's only one statement, we get back a non-module. That's
            # not what we want, we want a module, so we add it here:
            self._parsed = self.convert_node(self._grammar,
                                             self._grammar.symbol2number['file_input'],
                                             [self._parsed])

        if self._added_newline:
            self.remove_last_newline()

    def get_parsed_node(self):
        # TODO rename to get_root_node
        return self._parsed

    def error_recovery(self, grammar, stack, arcs, typ, value, start_pos, prefix,
                       add_token_callback):
        raise ParseError

    def convert_node(self, grammar, type, children):
        """
        Convert raw node information to a Node instance.

        This is passed to the parser driver which calls it whenever a reduction of a
        grammar rule produces a new complete node, so that the tree is build
        strictly bottom-up.
        """
        symbol = grammar.number2symbol[type]
        try:
            new_node = Parser.AST_MAPPING[symbol](children)
        except KeyError:
            new_node = pt.Node(symbol, children)

        # We need to check raw_node always, because the same node can be
        # returned by convert multiple times.
        if symbol == 'global_stmt':
            self._global_names += new_node.get_global_names()
        elif isinstance(new_node, pt.Lambda):
            new_node.names_dict = self._scope_names_stack.pop()
        elif isinstance(new_node, (pt.ClassOrFunc, pt.Module)) \
                and symbol in ('funcdef', 'classdef', 'file_input'):
            # scope_name_stack handling
            scope_names = self._scope_names_stack.pop()
            if isinstance(new_node, pt.ClassOrFunc):
                n = new_node.name
                scope_names[n.value].remove(n)
                # Set the func name of the current node
                arr = self._scope_names_stack[-1].setdefault(n.value, [])
                arr.append(n)
            new_node.names_dict = scope_names
        elif isinstance(new_node, pt.CompFor):
            # The name definitions of comprehenions shouldn't be part of the
            # current scope. They are part of the comprehension scope.
            for n in new_node.get_defined_names():
                self._scope_names_stack[-1][n.value].remove(n)
        return new_node

    def convert_leaf(self, grammar, type, value, prefix, start_pos):
        # print('leaf', repr(value), token.tok_name[type])
        if type == tokenize.NAME:
            if value in grammar.keywords:
                if value in ('def', 'class', 'lambda'):
                    self._scope_names_stack.append({})

                return pt.Keyword(self.position_modifier, value, start_pos, prefix)
            else:
                name = pt.Name(self.position_modifier, value, start_pos, prefix)
                # Keep a listing of all used names
                arr = self._used_names.setdefault(name.value, [])
                arr.append(name)
                arr = self._scope_names_stack[-1].setdefault(name.value, [])
                arr.append(name)
                return name
        elif type == STRING:
            return pt.String(self.position_modifier, value, start_pos, prefix)
        elif type == NUMBER:
            return pt.Number(self.position_modifier, value, start_pos, prefix)
        elif type == NEWLINE:
            return pt.Newline(self.position_modifier, value, start_pos, prefix)
        elif type == INDENT:
            return pt.Indent(self.position_modifier, value, start_pos, prefix)
        elif type == DEDENT:
            return pt.Dedent(self.position_modifier, value, start_pos, prefix)
        elif type == ENDMARKER:
            return pt.EndMarker(self.position_modifier, value, start_pos, prefix)
        else:
            return pt.Operator(self.position_modifier, value, start_pos, prefix)

    def remove_last_newline(self):
        """
        In all of this we need to work with _start_pos, because if we worked
        with start_pos, we would need to check the position_modifier as well
        (which is accounted for in the start_pos property).
        """
        endmarker = self._parsed.children[-1]
        # The newline is either in the endmarker as a prefix or the previous
        # leaf as a newline token.
        prefix = endmarker.prefix
        if prefix.endswith('\n'):
            endmarker.prefix = prefix = prefix[:-1]
            last_end = 0
            if '\n' not in prefix:
                # Basically if the last line doesn't end with a newline. we
                # have to add the previous line's end_position.
                try:
                    last_end = endmarker.get_previous_leaf().end_pos[1]
                except IndexError:
                    pass
            last_line = re.sub('.*\n', '', prefix)
            endmarker._start_pos = endmarker._start_pos[0] - 1, last_end + len(last_line)
        else:
            try:
                newline = endmarker.get_previous_leaf()
            except IndexError:
                return  # This means that the parser is empty.
            while True:
                if newline.value == '':
                    # Must be a DEDENT, just continue.
                    try:
                        newline = newline.get_previous_leaf()
                    except IndexError:
                        # If there's a statement that fails to be parsed, there
                        # will be no previous leaf. So just ignore it.
                        break
                elif newline.value != '\n':
                    # TODO REMOVE, error recovery was simplified.
                    # This may happen if error correction strikes and removes
                    # a whole statement including '\n'.
                    break
                else:
                    newline.value = ''
                    if self._last_failed_start_pos > newline._start_pos:
                        # It may be the case that there was a syntax error in a
                        # function. In that case error correction removes the
                        # right newline. So we use the previously assigned
                        # _last_failed_start_pos variable to account for that.
                        endmarker._start_pos = self._last_failed_start_pos
                    else:
                        endmarker._start_pos = newline._start_pos
                    break


class ParserWithRecovery(Parser):
    """
    This class is used to parse a Python file, it then divides them into a
    class structure of different scopes.

    :param grammar: The grammar object of pgen2. Loaded by load_grammar.
    :param source: The codebase for the parser. Must be unicode.
    :param module_path: The path of the module in the file system, may be None.
    :type module_path: str
    """
    def __init__(self, grammar, source, module_path=None, tokenizer=None,
                 start_parsing=True):
        self.syntax_errors = []

        self._omit_dedent_list = []
        self._indent_counter = 0

        # TODO do print absolute import detection here.
        # try:
        #     del python_grammar_no_print_statement.keywords["print"]
        # except KeyError:
        #     pass  # Doesn't exist in the Python 3 grammar.

        # if self.options["print_function"]:
        #     python_grammar = pygram.python_grammar_no_print_statement
        # else:
        super(ParserWithRecovery, self).__init__(
            grammar, source,
            tokenizer=tokenizer,
            start_parsing=start_parsing
        )
        if start_parsing:
            self.module = self._parsed
            self.module.used_names = self._used_names
            self.module.path = module_path
            self.module.global_names = self._global_names

    def parse(self, tokenizer):
        return super(ParserWithRecovery, self).parse(self._tokenize(self._tokenize(tokenizer)))

    def error_recovery(self, grammar, stack, arcs, typ, value, start_pos, prefix,
                       add_token_callback):
        """
        This parser is written in a dynamic way, meaning that this parser
        allows using different grammars (even non-Python). However, error
        recovery is purely written for Python.
        """
        def current_suite(stack):
            # For now just discard everything that is not a suite or
            # file_input, if we detect an error.
            for index, (dfa, state, (type_, nodes)) in reversed(list(enumerate(stack))):
                # `suite` can sometimes be only simple_stmt, not stmt.
                symbol = grammar.number2symbol[type_]
                if symbol == 'file_input':
                    break
                elif symbol == 'suite' and len(nodes) > 1:
                    # suites without an indent in them get discarded.
                    break
                elif symbol == 'simple_stmt' and len(nodes) > 1:
                    # simple_stmt can just be turned into a Node, if there are
                    # enough statements. Ignore the rest after that.
                    break
            return index, symbol, nodes

        index, symbol, nodes = current_suite(stack)
        if symbol == 'simple_stmt':
            index -= 2
            (_, _, (type_, suite_nodes)) = stack[index]
            symbol = grammar.number2symbol[type_]
            suite_nodes.append(pt.Node(symbol, list(nodes)))
            # Remove
            nodes[:] = []
            nodes = suite_nodes
            stack[index]

        # print('err', token.tok_name[typ], repr(value), start_pos, len(stack), index)
        if self._stack_removal(grammar, stack, arcs, index + 1, value, start_pos):
            add_token_callback(typ, value, start_pos, prefix)
        else:
            if typ == INDENT:
                # For every deleted INDENT we have to delete a DEDENT as well.
                # Otherwise the parser will get into trouble and DEDENT too early.
                self._omit_dedent_list.append(self._indent_counter)
            else:
                error_leaf = pt.ErrorLeaf(self.position_modifier, typ, value, start_pos, prefix)
                stack[-1][2][1].append(error_leaf)

    def _stack_removal(self, grammar, stack, arcs, start_index, value, start_pos):
        failed_stack = []
        found = False
        all_nodes = []
        for dfa, state, (typ, nodes) in stack[start_index:]:
            if nodes:
                found = True
            if found:
                symbol = grammar.number2symbol[typ]
                failed_stack.append((symbol, nodes))
                all_nodes += nodes
            if nodes and nodes[0] in ('def', 'class', 'lambda'):
                self._scope_names_stack.pop()
        if failed_stack:
            stack[start_index - 1][2][1].append(pt.ErrorNode(all_nodes))

        self._last_failed_start_pos = start_pos

        stack[start_index:] = []
        return failed_stack

    def _tokenize(self, tokenizer):
        for typ, value, start_pos, prefix in tokenizer:
            # print(tokenize.tok_name[typ], repr(value), start_pos, repr(prefix))
            if typ == DEDENT:
                # We need to count indents, because if we just omit any DEDENT,
                # we might omit them in the wrong place.
                o = self._omit_dedent_list
                if o and o[-1] == self._indent_counter:
                    o.pop()
                    continue

                self._indent_counter -= 1
            elif typ == INDENT:
                self._indent_counter += 1

            yield typ, value, start_pos, prefix

    def __repr__(self):
        return "<%s: %s>" % (type(self).__name__, self.module)
