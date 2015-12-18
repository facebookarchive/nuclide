#!/usr/bin/env python

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

# To ensure that Nuclide is easy to set up and install,
# we want to limit our dependencies to built-in Python libraries
# and libraries that are checked into fbobjc and are on the PYTHONPATH
# created by serve_lib_clang.
from clang.cindex import *
from codecomplete import get_completions
from declarationlocation import get_declaration_location_and_spelling

import json
import os
import re
import sys
import traceback
import logging
from logging import FileHandler

FD_FOR_READING = 3

# Unfortunately Clang has no way of limiting autocompletion results, but set a reasonable limit
# to avoid overloading the Atom UI.
COMPLETIONS_LIMIT = 100

def set_up_logging():
  handler = FileHandler('/tmp/nuclide-clang.log')
  handler.setFormatter(logging.Formatter(
    'nuclide-clang-py: [%(name)s] %(message)s'
  ))
  root_logger = logging.getLogger()
  root_logger.addHandler(handler)
  root_logger.setLevel(logging.INFO)
  root_logger.info('starting')

def wait_for_init():
  fd = FD_FOR_READING
  mode = 'r'
  buffering = 1 # 1 means line-buffered.
  input_stream = os.fdopen(fd, mode, buffering)
  output_stream = sys.stdout
  first_line = input_stream.readline()
  if first_line == 'init\n':
    # Client is initiating connection. Acknowledge!
    output_stream.write('ack\n');
    output_stream.flush();
    return input_stream, output_stream
  else:
    # Fail: did not receive proper initialization sequence.
    sys.exit(2)


class Server:

  def __init__(self, input_stream, output_stream):
    self.input_stream = input_stream
    self.output_stream = output_stream
    self.index = Index.create()
    self.src_to_translation_unit = {}

  def run(self):
    input_stream = self.input_stream
    output_stream = self.output_stream
    while True:
      line = input_stream.readline()
      response = self.process_request(line)
      json.dump(response, output_stream)
      output_stream.write('\n') # Use \n to signal the end of the response.
      output_stream.flush()

  def process_request(self, line):
    '''Note that line will likely including a trailing newline.

    Returns a dict or list that can be serialized by json.dump().
    '''
    request = json.loads(line)

    # Every request should have an id that must also be present in the response.
    reqid = request['reqid']
    response = { 'reqid': reqid }

    try:
      method = request['method']
      if method == 'compile':
        self.compile(request, response)
      elif method == 'get_completions':
        self.get_completions(request, response)
      elif method == 'get_declaration':
        self.get_declaration(request, response)
      elif method == 'get_declaration_info':
        self.get_declaration_info(request, response)
      else:
        response['error'] = 'Unknown method to clang_server.py: %s.' % method
    except:
      response['error'] = traceback.format_exc()

    # response must have a key named "error" if there was a failure of any kind.
    return response

  def _get_translation_unit(self, src, flags=None):
    '''flags can be optional if the translation unit is in the cache.'''
    translation_unit = self.src_to_translation_unit.get(src)
    if translation_unit is None:
      translation_unit = self._create_translation_unit(src, flags)
      self.src_to_translation_unit[src] = translation_unit
    return translation_unit

  def _create_translation_unit(self, src, flags):
    if flags is None:
      return None

    unsaved_files = None
    # Configure the options.
    # See also clang_defaultEditingTranslationUnitOptions in Index.h.
    options = (
        TranslationUnit.PARSE_PRECOMPILED_PREAMBLE |
        TranslationUnit.PARSE_CACHE_COMPLETION_RESULTS |
        TranslationUnit.PARSE_INCLUDE_BRIEF_COMMENTS_IN_CODE_COMPLETION |
        TranslationUnit.PARSE_INCOMPLETE)

    args = self._get_args_for_flags(src, flags)
    translation_unit = self.index.parse(src, args, unsaved_files, options)
    return translation_unit

  def _get_args_for_flags(self, src, flags):
    args = []
    for arg in flags:
      if arg == src:
        # Including the input file as an argument causes index.parse() to fail.
        # Surprisingly, including '/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang'
        # as the first argument does not cause any issues.
        pass
      elif arg == '-c':
        # No need to generate a .o file.
        args.append('-fsyntax-only')
      elif arg == '-Werror':
        # We disable this so that the severity can be better reflected in the UI.
        # For example, this allows unused code to appear as a warning instead of an error.
        pass
      elif arg == '-MMD' or arg == '-MD':
        # Do not write out dependency files.
        pass
      else:
        args.append(arg)
    return args

  def compile(self, request, response):
    src = request['src']
    contents = request['contents']
    flags = request['flags']

    # Update the translation unit with the latest contents.
    translation_unit = self._tryUpdateTranslationUnit(src, contents, flags)
    if not translation_unit:
      sys.stderr.write('Suspicious: requesting compilation of %s without flags' % src)
      response['diagnostics'] = []
      return

    # Return the diagnostics.
    diagnostics = []
    for diag in translation_unit.diagnostics:
      ranges = []
      # Clang indexes for line and column are 1-based.
      for source_range in diag.ranges:
        ranges.append({
          'start': {
            'line': source_range.start.line - 1,
            'column': source_range.start.column - 1,
          },
          'end': {
            'line': source_range.end.line - 1,
            'column': source_range.end.column - 1,
          }
        })
      if len(ranges) == 0:
        ranges = None
      diagnostics.append({
        'spelling': diag.spelling,
        'severity': diag.severity,
        'location': {
          'file': str(diag.location.file),
          'line': diag.location.line - 1,
          'column': diag.location.column - 1,
        },
        'ranges': ranges,
      })
    response['diagnostics'] = diagnostics

  def get_completions(self, request, response):
    src = request['src']
    contents = request['contents']
    line = request['line']
    column = request['column']
    prefix = request['prefix']
    token_start_column = request['tokenStartColumn']
    flags = request['flags']

    # NOTE: there is no need to update the translation unit here.
    # libclang's completions API seamlessly takes care of unsaved content
    # without any special handling.
    translation_unit = self._get_translation_unit(src, flags)
    if translation_unit:
      completions = get_completions(
          translation_unit,
          src,
          line + 1,
          token_start_column + 1,
          prefix,
          contents,
          limit=COMPLETIONS_LIMIT)
    else:
      completions = []
    response['file'] = src
    response['completions'] = completions
    response['line'] = line
    response['column'] = column
    response['prefix'] = prefix

  def get_declaration(self, request, response):
    src = request['src']
    contents = request['contents']
    line = request['line']
    column = request['column']
    flags = request['flags']

    response['src'] = src
    response['line'] = line
    response['column'] = column

    # Update the translation unit with the latest contents.
    translation_unit = self._tryUpdateTranslationUnit(src, contents, flags)
    if not translation_unit: return

    location_and_spelling = get_declaration_location_and_spelling(translation_unit, src, line + 1, column + 1)
    # Clang returns 1-indexed values, but we want to return 0-indexed.
    if location_and_spelling:
      location_and_spelling['line'] -= 1
      location_and_spelling['column'] -= 1
      location_and_spelling['extent']['start']['line'] -= 1
      location_and_spelling['extent']['start']['column'] -= 1
      location_and_spelling['extent']['end']['line'] -= 1
      location_and_spelling['extent']['end']['column'] -= 1
    response['locationAndSpelling'] = location_and_spelling

  def get_declaration_info(self, request, response):
    src = request['src']
    contents = request['contents']
    line = request['line']
    column = request['column']
    flags = request['flags']

    response['src'] = src
    response['line'] = line
    response['column'] = column

    # Update the translation unit with the latest contents.
    translation_unit = self._tryUpdateTranslationUnit(src, contents, flags)
    if not translation_unit: return

    location = translation_unit.get_location(src, (line + 1, column + 1))
    cursor = Cursor.from_location(translation_unit, location)
    cursor = cursor.referenced
    if cursor is None: return

    response['info'] = self.get_declaration_info_for_cursor(cursor)

  def get_declaration_info_for_cursor(self, cursor):
    '''Returns string id in clang-callgraph-service format for entity under the
    cursor. Currently works only for definitions of class methods, instance
    methods and functions. Returns None for everything else.
    '''
    result = []
    while cursor is not None and not cursor.kind.is_translation_unit():
      file = cursor.location.file
      result.append({
        'name': self.get_name_for_cursor(cursor),
        'type': cursor.kind.name,
        'cursor_usr': cursor.get_usr(),
        'file': file.name if file is not None else None,
      })
      cursor = cursor.semantic_parent

    return result

  def get_name_for_cursor(self, cursor):
    name = cursor.displayname
    # clang doesn't include the interface name for categories; add it manually
    if (cursor.kind == CursorKind.OBJC_CATEGORY_DECL or
        cursor.kind == CursorKind.OBJC_CATEGORY_IMPL_DECL):
      # Find reference to base class.
      base_name = ''
      for child in cursor.get_children():
        if child.kind == CursorKind.OBJC_CLASS_REF:
          base_name = child.displayname
          break
      return base_name + ' (' + name + ')'
    return name

  def _update(self, translation_unit, src, unsaved_contents=None):
    # If unsaved_contents is unspecified, then assume that the file can be read
    # directly from disk as-is.
    if unsaved_contents:
      contents_as_str = unsaved_contents.encode('utf8')
      unsaved_files = [(src, contents_as_str)]
    else:
      unsaved_files = []
    options = 0 # There are no reparse options available in libclang yet.
    translation_unit.reparse(unsaved_files, options)

  def _tryUpdateTranslationUnit(self, src, unsaved_contents=None, flags=None):
    '''Returns None if the flags for the src cannot be found.'''
    translation_unit = self._get_translation_unit(src, flags)
    if translation_unit is None:
      return None
    self._update(translation_unit, src, unsaved_contents)
    return translation_unit


if __name__ == '__main__':
  lib_clang_file = os.environ.get('LIB_CLANG_LIBRARY_FILE')
  if lib_clang_file:
    Config.set_library_file(lib_clang_file)
  set_up_logging()
  input_stream, output_stream = wait_for_init()
  Server(input_stream, output_stream).run()
