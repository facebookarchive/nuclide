'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../modules/nuclide-commons-atom/go-to-location');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

const LIMIT = 100;
const QUALIFYING_FIELDS = ['class', 'namespace', 'struct', 'enum', 'Module'];

/**
 * If a line number is specified by the tag, jump to that line.
 * Otherwise, we'll have to look up the pattern in the file.
 */
function createCallback(tag) {
  return async () => {
    const lineNumber = await (0, (_utils || _load_utils()).getLineNumberForTag)(tag);
    (0, (_goToLocation || _load_goToLocation()).goToLocation)(tag.file, { line: lineNumber, column: 0 });
  };
}

function commonPrefixLength(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i++;
  }
  return i;
}

class HyperclickHelpers {
  static async getSuggestionForWord(textEditor, text, range) {
    const path = textEditor.getPath();
    if (path == null) {
      return null;
    }

    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getCtagsServiceByNuclideUri)(path);
    const ctagsService = await service.getCtagsService(path);

    if (ctagsService == null) {
      return null;
    }

    try {
      const tags = await ctagsService.findTags(text, { limit: LIMIT });
      if (!tags.length) {
        return null;
      }

      if (tags.length === 1) {
        return { range, callback: createCallback(tags[0]) };
      }

      // Favor tags in the nearest directory by sorting by common prefix length.
      tags.sort(({ file: a }, { file: b }) => {
        const len = commonPrefixLength(path, b) - commonPrefixLength(path, a);
        if (len === 0) {
          return a.localeCompare(b);
        }
        return len;
      });

      const tagsDir = (_nuclideUri || _load_nuclideUri()).default.dirname((await ctagsService.getTagsPath()));
      return {
        range,
        callback: tags.map(tag => {
          const { file, fields, kind } = tag;
          const relpath = (_nuclideUri || _load_nuclideUri()).default.relative(tagsDir, file);
          let title = `${tag.name} (${relpath})`;
          if (fields != null) {
            // Python uses a.b.c; most other languages use a::b::c.
            // There are definitely other cases, but it's not a big issue.
            const sep = file.endsWith('.py') ? '.' : '::';
            for (const field of QUALIFYING_FIELDS) {
              const val = fields.get(field);
              if (val != null) {
                title = val + sep + title;
                break;
              }
            }
          }
          if (kind != null && (_utils || _load_utils()).CTAGS_KIND_NAMES[kind] != null) {
            title = (_utils || _load_utils()).CTAGS_KIND_NAMES[kind] + ' ' + title;
          }
          return {
            title,
            callback: createCallback(tag)
          };
        })
      };
    } finally {
      ctagsService.dispose();
    }
  }
}
exports.default = HyperclickHelpers;