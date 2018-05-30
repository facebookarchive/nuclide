'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _common;

function _load_common() {
  return _common = require('./common');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-blame-provider-hg');

function canProvideBlameForEditor(editor) {
  return Boolean((0, (_common || _load_common()).hgRepositoryForEditor)(editor));
}

function getBlameForEditor(editor) {
  return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('blame-provider-hg:getBlameForEditor', () => doGetBlameForEditor(editor));
}

async function doGetBlameForEditor(editor) {
  const path = editor.getPath();
  // flowlint-next-line sketchy-null-string:off
  if (!path) {
    return Promise.resolve([]);
  }

  const repo = (0, (_common || _load_common()).hgRepositoryForEditor)(editor);
  if (!repo) {
    const message = `HgBlameProvider could not fetch blame for ${path}: no Hg repo found.`;
    logger.error(message);
    throw new Error(message);
  }

  return repo.getBlameAtHead(path);
}

let getUrlForRevision;
try {
  // $FlowFB
  const { getPhabricatorUrlForRevision } = require('./fb/FbHgBlameProvider');
  getUrlForRevision = getPhabricatorUrlForRevision;
} catch (e) {
  // Ignore case where FbHgBlameProvider is unavailable.
}

exports.default = {
  canProvideBlameForEditor,
  getBlameForEditor,
  getUrlForRevision
};