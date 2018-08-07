"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toHgUri = toHgUri;
exports.HgTextDocumentContentProvider = exports.HG_TEXT_DOCUMENT_CONTENT_PROVIDER_SCHEME = void 0;

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

function _remote() {
  const data = require("../remote");

  _remote = function () {
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
 *  strict-local
 * @format
 */
const HG_TEXT_DOCUMENT_CONTENT_PROVIDER_SCHEME = 'big-dig-hg';
exports.HG_TEXT_DOCUMENT_CONTENT_PROVIDER_SCHEME = HG_TEXT_DOCUMENT_CONTENT_PROVIDER_SCHEME;

class HgTextDocumentContentProvider {
  constructor() {
    this._onDidChangeEmitter = new (vscode().EventEmitter)();
    this.onDidChange = this._onDidChangeEmitter.event;
  }

  async provideTextDocumentContent(uri, token) {
    if (uri.scheme !== HG_TEXT_DOCUMENT_CONTENT_PROVIDER_SCHEME) {
      throw new Error(`Expected scheme ${HG_TEXT_DOCUMENT_CONTENT_PROVIDER_SCHEME} but got "${uri.scheme}".`);
    }

    const {
      authority
    } = uri; // It appears that VS Code might request for big-dig-hg:// URIs for
    // anything, even your settings.json file. This is a quick check for this
    // case.

    if (authority === '') {
      return '';
    }

    const remoteServer = (0, _remote().getServers)().find(server => server.getAddress() === authority);

    if (remoteServer == null) {
      const error = `Could not find a remote server for uri "${String(uri)}".`;
      (0, _log4js().getLogger)().error(error);
      return '';
    }

    const connectionWrapper = await remoteServer.connect();

    if (token.isCancellationRequested) {
      return;
    } // Parse the URI. Then find the appropriate ConnectionWrapper
    // to use to talk to the remote Hg.


    const {
      path,
      params
    } = fromHgUri(uri); // TODO(T27297370): Provide a caching layer for these hgGetContents() calls.

    const {
      contents
    } = await connectionWrapper.hgGetContents(path, params.ref);

    if (token.isCancellationRequested || contents == null) {
      return;
    }

    return contents;
  }

}
/*
 * Here we take a cue from VS Code's own Git extension and encode the ref as
 * a query param. We also add a `.hg` file extension to the path to prevent
 * linters and things from trying to run on these hg:// URIs.
 */


exports.HgTextDocumentContentProvider = HgTextDocumentContentProvider;
const HG_SUFFIX = '.hg';

function toHgUri(uri, ref = '') {
  const params = {
    ref
  };
  const path = `${uri.path}${HG_SUFFIX}`;
  return uri.with({
    scheme: 'big-dig-hg',
    path,
    query: JSON.stringify(params)
  });
}

function fromHgUri(uri) {
  const path = uri.path.slice(0, -HG_SUFFIX.length);
  const params = JSON.parse(uri.query);
  return {
    path,
    params
  };
}