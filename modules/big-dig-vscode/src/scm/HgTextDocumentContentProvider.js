/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {TextDocumentContentProvider} from 'vscode';

import * as vscode from 'vscode';
import {getLogger} from 'log4js';
import {getServers} from '../remote';

export const HG_TEXT_DOCUMENT_CONTENT_PROVIDER_SCHEME = 'big-dig-hg';

export class HgTextDocumentContentProvider
  implements TextDocumentContentProvider {
  +_onDidChangeEmitter: vscode.EventEmitter<
    vscode.Uri,
  > = new vscode.EventEmitter();

  onDidChange: vscode.Event<vscode.Uri> = this._onDidChangeEmitter.event;

  async provideTextDocumentContent(
    uri: vscode.Uri,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<string> {
    if (uri.scheme !== HG_TEXT_DOCUMENT_CONTENT_PROVIDER_SCHEME) {
      throw new Error(
        `Expected scheme ${HG_TEXT_DOCUMENT_CONTENT_PROVIDER_SCHEME} but got "${
          uri.scheme
        }".`,
      );
    }

    const {authority} = uri;
    // It appears that VS Code might request for big-dig-hg:// URIs for
    // anything, even your settings.json file. This is a quick check for this
    // case.
    if (authority === '') {
      return '';
    }

    const remoteServer = getServers().find(
      server => server.getAddress() === authority,
    );

    if (remoteServer == null) {
      const error = `Could not find a remote server for uri "${String(uri)}".`;
      getLogger().error(error);
      return '';
    }

    const connectionWrapper = await remoteServer.connect();
    if (token.isCancellationRequested) {
      return;
    }

    // Parse the URI. Then find the appropriate ConnectionWrapper
    // to use to talk to the remote Hg.
    const {path, params} = fromHgUri(uri);
    // TODO(T27297370): Provide a caching layer for these hgGetContents() calls.
    const {contents} = await connectionWrapper.hgGetContents(path, params.ref);
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
const HG_SUFFIX = '.hg';

export function toHgUri(uri: vscode.Uri, ref: string = ''): vscode.Uri {
  const params = {
    ref,
  };

  const path = `${uri.path}${HG_SUFFIX}`;
  return uri.with({
    scheme: 'big-dig-hg',
    path,
    query: JSON.stringify(params),
  });
}

function fromHgUri(uri: vscode.Uri) {
  const path = uri.path.slice(0, -HG_SUFFIX.length);
  const params = JSON.parse(uri.query);
  return {path, params};
}
