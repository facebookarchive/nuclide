"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _common() {
  const data = require("./common");

  _common = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
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
const logger = (0, _log4js().getLogger)('nuclide-blame-provider-hg');

function canProvideBlameForEditor(editor) {
  return Boolean((0, _common().hgRepositoryForEditor)(editor));
}

function getBlameForEditor(editor) {
  return (0, _nuclideAnalytics().trackTiming)('blame-provider-hg:getBlameForEditor', () => doGetBlameForEditor(editor));
}

async function doGetBlameForEditor(editor) {
  const path = editor.getPath(); // flowlint-next-line sketchy-null-string:off

  if (!path) {
    return Promise.resolve([]);
  }

  const repo = (0, _common().hgRepositoryForEditor)(editor);

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
  const {
    getPhabricatorUrlForRevision
  } = require("./fb/FbHgBlameProvider");

  getUrlForRevision = getPhabricatorUrlForRevision;
} catch (e) {// Ignore case where FbHgBlameProvider is unavailable.
}

var _default = {
  canProvideBlameForEditor,
  getBlameForEditor,
  getUrlForRevision
};
exports.default = _default;