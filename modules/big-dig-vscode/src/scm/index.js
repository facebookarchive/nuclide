"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startScm = startScm;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
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

function _HgScm() {
  const data = require("./HgScm");

  _HgScm = function () {
    return data;
  };

  return data;
}

function _remote() {
  const data = require("../remote");

  _remote = function () {
    return data;
  };

  return data;
}

function _HgTextDocumentContentProvider() {
  const data = require("./HgTextDocumentContentProvider");

  _HgTextDocumentContentProvider = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('hg-scm');

function startScm() {
  const sub = (0, _remote().onEachFilesystem)(fs => fs.getServer().onEachConnection(conn => startMercurialForConnection(fs, conn)));
  const hgDocumentProvider = vscode().workspace.registerTextDocumentContentProvider(_HgTextDocumentContentProvider().HG_TEXT_DOCUMENT_CONTENT_PROVIDER_SCHEME, new (_HgTextDocumentContentProvider().HgTextDocumentContentProvider)());
  return vscode().Disposable.from(sub, hgDocumentProvider);
}

async function startMercurialForConnection(filesystem, conn) {
  const failedWorkspaces = [];
  const repos = await Promise.all(filesystem.getWorkspaceFolders().map(async workspace => {
    try {
      return await conn.hgIsRepo(filesystem.uriToPath(workspace.uri));
    } catch (error) {
      logger.error(error);
      failedWorkspaces.push(workspace.name); // Prevent breaking *all* repos:

      return null;
    }
  }));

  if (failedWorkspaces.length > 0) {
    vscode().window.showErrorMessage('Could not load mercurial repository for workspaces: ' + failedWorkspaces.join(', '));
  } // Multiple workspace folders may share the same repo


  const roots = [...new Set(repos.filter(Boolean).map(x => x.root).filter(Boolean))];
  const hgScms = roots.map(root => {
    try {
      return new (_HgScm().HgScm)(root, filesystem, conn.hgObserveStatus(root));
    } catch (error) {
      logger.error(error);
      vscode().window.showErrorMessage(`Mercurial failed for ${filesystem.pathToUri(root).toString()}: ` + error.message);
    }
  }).filter(Boolean);
  return vscode().Disposable.from(...hgScms);
}