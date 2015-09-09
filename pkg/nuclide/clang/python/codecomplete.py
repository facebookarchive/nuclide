# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from clang.cindex import *

def get_completions(translation_unit, absolute_path, line, column, prefix, contents=None):
  unsaved_files = []
  if contents:
    contents_as_str = contents.encode('utf8')
    unsaved_files.append((absolute_path, contents_as_str))

  results = translation_unit.codeComplete(absolute_path, line, column, unsaved_files)
  completions = []
  for result in results.results:
    completion_string = result.string
    # From Index.h: Smaller values indicate higher-priority (more likely) completions.
    if completion_string.priority > 50:
      continue

    first_token = _getFirstNonResultTypeTokenChunk(completion_string)
    if not first_token or (prefix and not first_token.startswith(prefix)):
      continue

    completions.append(completion_string)

  completions.sort(key=lambda completion_string: completion_string.priority)

  def to_replacement(completion_string):
    chunks = []
    spelling = ''
    result_type = ''

    # We want to know which chunks are placeholders.
    for chunk in completion_string:
      spelling += chunk.spelling

      # There should be at most one ResultType chunk and it should tell us
      # type of suggested expression. For example, if a method call is
      # suggested, this chunk will be equal to the method return type.
      # Obviously, we don't want that chunk in spelling.
      if chunk.isKindResultType():
        result_type = chunk.spelling
        spelling += ' '
        continue

      chunks.append({
          'spelling': chunk.spelling,
          'isPlaceHolder': chunk.isKindPlaceHolder(),
      })

    return {
      'spelling': spelling,
      'chunks': chunks,
      'result_type': result_type,
      'first_token': _getFirstNonResultTypeTokenChunk(completion_string),
    }
  return map(to_replacement, completions)


def _getFirstNonResultTypeTokenChunk(completion_string):
  for chunk in completion_string:
    if not chunk.isKindResultType():
      return chunk.spelling
  return None


if __name__ == '__main__':
  from optparse import OptionParser
  parser = OptionParser()
  parser.add_option('-l', '--line', dest='line', type='int')
  parser.add_option('-c', '--col', '--column', dest='column', type='int')
  parser.add_option('-p', '--prefix', dest='prefix', type='string', default='')

  (options, args) = parser.parse_args()
  absolute_path = args[0]

  # TODO(mbolin): Need to call create_translation_unit() from somewhere.
  translation_unit = create_translation_unit(absolute_path)
  completions = get_completions(
      translation_unit,
      absolute_path,
      options.line,
      options.column,
      options.prefix,
      contents=None,
      )
  for completion in completions:
    print completion
