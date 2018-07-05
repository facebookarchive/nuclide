/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {BigDigClient} from 'big-dig/src/client';
import type {IDisposable} from 'vscode';
import type {
  BufferEncoding,
  CliListenData,
  CliListenParams,
  DebuggerListParams,
  DebuggerListResult,
  ExecKillParams,
  ExecKillResult,
  ExecObserveParams,
  ExecResizeParams,
  ExecResizeResult,
  ExecResponse,
  ExecSpawnParams,
  ExecStdinParams,
  ExecStdinResult,
  FsGetFileContentsParams,
  FsMkdirParams,
  FsMkdirResult,
  FsMoveParams,
  FsMoveResult,
  FsCopyParams,
  FsCopyResult,
  FsDeleteParams,
  FsDeleteResult,
  FsReadParams,
  FsReaddirParams,
  FsReaddirResult,
  FsStatParams,
  FsStatResult,
  FsWatchData,
  FsWatchParams,
  FsWriteParams,
  FsWriteResult,
  HgGetContentsParams,
  HgGetContentsResult,
  HgIsRepoParams,
  HgIsRepoResult,
  HgObserveStatusData,
  HgObserveStatusParams,
  LspListParams,
  LspListResult,
  SearchForFilesParams,
  SearchForFilesResult,
  SearchForTextData,
  SearchForTextDatum,
  SearchForTextParams,
  ServerGetStatusResult,
  Range,
} from 'big-dig-vscode-server/Protocol';
import type {RemoteFileSystemClient} from 'big-dig/src/services/fs/fsClient';

import * as vscode from 'vscode';
import EventEmitter from 'events';
import {Observable} from 'rxjs';
import {Deferred} from 'nuclide-commons/promise';
import {getLogger} from 'log4js';
import {createThriftClient} from 'big-dig/src/services/fs/fsClient';

const BUFFER_ENCODING: BufferEncoding = 'utf-8';
const TAG = 'json-rpc';

export class ConnectionClosed extends Error {
  constructor() {
    super('Connection was closed');
  }
}

export class RpcMethodError extends Error {
  +parameters: Object;
  constructor(message: {error: string, errorParams?: Object}) {
    super(message.error);
    this.parameters = message.errorParams || {};
  }
}

export type TextSearchResult = {
  path: string,
  preview: {
    leading: string,
    matching: string,
    trailing: string,
  },
  range: vscode.Range,
};

// $FlowIssue: IDisposable is an interface, but Flow thinks otherwise.
export class ConnectionWrapper implements IDisposable {
  _bigDigClient: BigDigClient;
  _nextId: number;
  _emitter: EventEmitter;
  _closed: Deferred<empty> = new Deferred();
  _fsThriftClient: ?RemoteFileSystemClient = null;
  _fsThriftClientPromise: ?Promise<RemoteFileSystemClient> = null;

  constructor(bigDigClient: BigDigClient) {
    this._bigDigClient = bigDigClient;
    this._nextId = 0;
    this._emitter = new EventEmitter();

    if (bigDigClient.isClosed()) {
      this._closed.reject(new ConnectionClosed());
    }
    bigDigClient.onClose(() => {
      this._closed.reject(new ConnectionClosed());
    });

    const observable = bigDigClient.onMessage(TAG);
    observable.subscribe({
      // Must use arrow function so that `this` is bound correctly.
      next: value => {
        const response = JSON.parse(value);
        this._emitter.emit(response.id, response);
      },
      error(err) {
        // eslint-disable-next-line no-console
        console.error('Error received in ConnectionWrapper', err);
      },
      complete() {
        // eslint-disable-next-line no-console
        console.error('ConnectionWrapper completed()?');
      },
    });
  }

  isClosed(): boolean {
    return this._bigDigClient.isClosed();
  }

  onClose(callback: () => mixed) {
    return this._bigDigClient.onClose(callback);
  }

  getAddress(): string {
    return this._bigDigClient.getAddress();
  }

  shutdown(): Promise<void> {
    return this._makeRpc('shutdown', {});
  }

  getServerStatus(): Promise<ServerGetStatusResult> {
    return this._makeRpc('get-status', {});
  }

  getOrCreateThriftClient(): Promise<RemoteFileSystemClient> {
    if (this._fsThriftClient != null) {
      return Promise.resolve(this._fsThriftClient);
    }
    return this._getThriftClientPromise();
  }

  _getThriftClientPromise(): Promise<RemoteFileSystemClient> {
    if (this._fsThriftClientPromise != null) {
      return this._fsThriftClientPromise;
    }

    const clientConfig = {port: 9000};
    this._fsThriftClientPromise = createThriftClient(clientConfig).then(
      client => {
        this._fsThriftClientPromise = null;
        this._fsThriftClient = client;
        return client;
      },
      error => {
        this._fsThriftClientPromise = null;
        return Promise.reject(error);
      },
    );
    return this._fsThriftClientPromise;
  }

  async fsGetFileContents(path: string): Promise<string> {
    const params: FsGetFileContentsParams = {path};
    const {contents} = await this._makeRpc('fs/get-file-contents', params);
    return contents;
  }

  fsStat(path: string): Promise<FsStatResult> {
    const params: FsStatParams = {path};
    return this._makeRpc('fs/stat', params);
  }

  fsRead(params: FsReadParams): Observable<Buffer> {
    return this._makeObservable('fs/read', params).map(data =>
      Buffer.from(data, BUFFER_ENCODING),
    );
  }

  fsWrite(
    path: string,
    data: Buffer | string,
    options: {create: boolean, overwrite: boolean},
  ): Promise<FsWriteResult> {
    const params: FsWriteParams = {
      path,
      content: Buffer.from(data).toString(BUFFER_ENCODING),
      create: options.create,
      overwrite: options.overwrite,
    };
    return this._makeRpc('fs/write', params);
  }

  fsMove(
    source: string,
    destination: string,
    options: {overwrite: boolean},
  ): Promise<FsMoveResult> {
    const params: FsMoveParams = {
      source,
      destination,
      overwrite: options.overwrite,
    };
    return this._makeRpc('fs/move', params);
  }

  fsCopy(
    source: string,
    destination: string,
    options: {overwrite: boolean},
  ): Promise<FsCopyResult> {
    const params: FsCopyParams = {
      source,
      destination,
      overwrite: options.overwrite,
    };
    return this._makeRpc('fs/copy', params);
  }

  fsMkdir(path: string): Promise<FsMkdirResult> {
    const params: FsMkdirParams = {path};
    return this._makeRpc('fs/mkdir', params);
  }

  async fsReaddir(path: string): Promise<Array<[string, FsStatResult]>> {
    const params: FsReaddirParams = {path};
    const result: FsReaddirResult = await this._makeRpc('fs/readdir', params);
    return result;
  }

  fsDelete(
    path: string,
    options: {recursive: boolean},
  ): Promise<FsDeleteResult> {
    const params: FsDeleteParams = {path, recursive: options.recursive};
    return this._makeRpc('fs/delete', params);
  }

  fsWatch(
    path: string,
    options: {recursive: boolean, exclude: Array<string>},
  ): Observable<FsWatchData> {
    const {recursive, exclude} = options;
    const params: FsWatchParams = {path, recursive, exclude};
    return this._makeObservable('fs/watch', params);
  }

  searchForFiles(
    directory: string,
    query: string,
  ): Promise<SearchForFilesResult> {
    const params: SearchForFilesParams = {directory, query};
    return this._makeRpc('search/for-files', params);
  }

  searchForText(params: SearchForTextParams): Observable<TextSearchResult> {
    const result: Observable<SearchForTextData> = this._makeObservable(
      'search/for-text',
      params,
    );
    return result
      .mergeAll()
      .map(({path, range, preview}: SearchForTextDatum) => ({
        path,
        preview,
        range: makeRange(range),
      }));
  }

  cliListen(session: string): Observable<CliListenData> {
    const params: CliListenParams = {session};
    return this._makeObservable('cli/listen', params);
  }

  execSpawn(params: ExecSpawnParams): Observable<ExecResponse> {
    getLogger().info(`spawning ${params.cmd} ${params.args.join(' ')}`);
    return this._makeObservable('exec/spawn', params);
  }

  execStdin(pid: number, data: string): Promise<ExecStdinResult> {
    const params: ExecStdinParams = {pid, data};
    return this._makeRpc('exec/stdin', params);
  }

  execObserve(pid: number): Observable<ExecResponse> {
    const params: ExecObserveParams = {pid};
    return this._makeObservable('exec/observe', params);
  }

  execKill(pid: number, signal: string): Promise<ExecKillResult> {
    const params: ExecKillParams = {pid, signal};
    return this._makeRpc('exec/kill', params);
  }

  execResize(
    pid: number,
    columns: number,
    rows: number,
  ): Promise<ExecResizeResult> {
    const params: ExecResizeParams = {pid, columns, rows};
    return this._makeRpc('exec/resize', params);
  }

  debuggerList(directory: string): Promise<DebuggerListResult> {
    const params: DebuggerListParams = {directory};
    return this._makeRpc('debugger/list', params);
  }

  lspList(directory: string): Promise<LspListResult> {
    const params: LspListParams = {directory};
    return this._makeRpc('lsp/list', params);
  }

  hgIsRepo(directory: string): Promise<HgIsRepoResult> {
    const params: HgIsRepoParams = {directory};
    return this._makeRpc('hg/is-repo', params);
  }

  hgObserveStatus(root: string): Observable<HgObserveStatusData> {
    const params: HgObserveStatusParams = {root};
    return this._makeObservable('hg/status', params);
  }

  hgGetContents(path: string, ref: string): Promise<HgGetContentsResult> {
    const params: HgGetContentsParams = {path, ref};
    return this._makeRpc('hg/get-contents', params);
  }

  _sendMessage(message: string) {
    this._bigDigClient.sendMessage(TAG, message);
  }

  /**
   * This is for an RPC that expects a response.
   */
  _makeRpc(method: string, params: Object): Promise<any> {
    const id = (this._nextId++).toString(16);
    const response = new Promise((resolve, reject) => {
      function onResponse(message): void {
        if (message.error == null) {
          resolve(message.result);
        } else {
          reject(new RpcMethodError(message));
        }
      }
      this._emitter.once(id, onResponse);
      this._closed.promise.catch(error => {
        this._emitter.removeListener(id, onResponse);
        reject(error);
      });
    });
    const payload = {id, method, params};
    this._sendMessage(JSON.stringify(payload));
    return response;
  }

  /**
   * Creates an RPC around a remote observable. The remote call is made upon the first subscription.
   * When the last subscriber unsubscribes, this will unsubscribe from the remote subscription.
   */
  _makeObservable(method: string, params: Object): Observable<any> {
    return Observable.create(observer => {
      const id = (this._nextId++).toString(16);
      function onResponse(response): void {
        if (response.error != null) {
          observer.error(new RpcMethodError(response));
        } else if (response.complete != null) {
          observer.complete();
        } else {
          observer.next(response.message);
        }
      }
      this._emitter.on(id, onResponse);
      this._closed.promise.catch(error => {
        this._emitter.removeListener(id, onResponse);
        observer.error(error);
      });

      const payload = {id, method, params};
      this._sendMessage(JSON.stringify(payload));

      return () => {
        this._emitter.removeListener(id, onResponse);
        try {
          // This can fail if "unsubscribe" happens after the connection is closed. And we cannot
          // reliably determine if the connection is closed until we try sending a message.
          this._sendMessage(
            JSON.stringify({id, method: 'stream-unsubscribe', params: {}}),
          );
        } catch (error) {
          // We made an effort, but it seems the connection is already closed.
        }
      };
    });
  }

  dispose() {
    this._bigDigClient.close();
    this._emitter.removeAllListeners();
  }
}

function makeRange(range: Range): vscode.Range {
  return new vscode.Range(
    range.start.line,
    range.start.column,
    range.end.line,
    range.end.column,
  );
}
