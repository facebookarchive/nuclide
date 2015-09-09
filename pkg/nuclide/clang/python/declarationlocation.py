# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from clang.cindex import *
import logging
import os

logger = logging.getLogger(__name__)

def get_declaration_location_and_spelling(translation_unit, absolute_path, line, column):
  def log(s):
    logger.info('%s:%d:%d - %s', os.path.basename(absolute_path), line, column, s)

  source_location = translation_unit.get_location(absolute_path, (line, column))
  cursor = Cursor.from_location(translation_unit, source_location)
  if cursor is None:
    log('No cursor')
    return None

  # OBJC_INTERFACE_DECL extends all the way from @interface to @end; don't allow clicking on it.
  if cursor.kind.is_declaration():
    log('Ignoring declaration')
    return None

  referenced = cursor.referenced
  if referenced is None or referenced.location is None or referenced.location.file is None:
    log('No referenced information')
    return None

  loc = referenced.location
  log('Returning {0}:{1}:{2}'.format(os.path.basename(loc.file.name), loc.line, loc.column))

  # An extent has a `start` and `end` property, each of which have a `line` and `column` property.
  extent = cursor.extent

  return {
    'file': loc.file.name,
    'line': loc.line,
    'column': loc.column,
    'spelling': cursor.spelling,
    'extent': {
      'start': {'line': extent.start.line, 'column': extent.start.column},
      'end': {'line': extent.end.line, 'column': extent.end.column},
    },
  }

if __name__ == '__main__':
  from optparse import OptionParser
  parser = OptionParser()
  parser.add_option('-l', '--line', dest='line', type='int')
  parser.add_option('-c', '--col', '--column', dest='column', type='int')

  (options, args) = parser.parse_args()
  absolute_path = args[0]

  # TODO(mbolin): Need to call create_translation_unit() from somewhere.
  translation_unit = create_translation_unit(absolute_path)
  location = get_declaration_location(
    translation_unit,
    absolute_path,
    options.line,
    options.column,
  )
  print location
