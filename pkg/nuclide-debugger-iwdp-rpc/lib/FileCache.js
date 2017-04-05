/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import xfetch from '../../commons-node/xfetch';
import fsPromise from '../../commons-node/fsPromise';
import nuclideUri from '../../commons-node/nuclideUri';
import {logger} from './logger';

const {log} = logger;
// Android's stock emulator and other emulators such as genymotion use a standard localhost alias.
const EMULATOR_LOCALHOST_ADDR: RegExp = /10\.0\.2\.2|10\.0\.3\.2/;

type FileData = {
  nuclidePath: string, // Path that Nuclide can use to access the resource.
  targetPath: string, // Path that the target can use to access the resource.
  sourceMapUrl?: string, // Url that chrome devtools understands and can decode to get source maps.
};

const SOURCE_MAP_REGEX = /\/\/# sourceMappingURL=(.+)$/;
const SOURCE_MAP_PREFIX = 'data:application/json;base64,';

export class FileCache {
  _disposables: UniversalDisposable;
  _nuclidePathToFileData: Map<string, FileData>;
  _targetPathToFileData: Map<string, FileData>;
  _getScriptSource: (scriptId: string) => Promise<{result: {scriptSource: string}}>;

  constructor(
    getScriptSource: (scriptId: string) => Promise<{result: {scriptSource: string}}>,
  ) {
    this._getScriptSource = getScriptSource;
    this._nuclidePathToFileData = new Map();
    this._targetPathToFileData = new Map();
    this._disposables = new UniversalDisposable(
      () => this._nuclidePathToFileData.clear(),
      () => this._targetPathToFileData.clear(),
    );
  }

  scriptParsed(obj: Object): Promise<Object> {
    const {params} = obj;
    if (params == null) {
      return Promise.resolve(obj);
    }
    const {url: urlString} = params;
    if (urlString == null) {
      return Promise.resolve(obj);
    }
    if (urlString.startsWith('http:')) {
      return this._processScriptParsedWithDownloadableUrl(obj, urlString);
    }
    const {sourceMapURL} = params;
    if (sourceMapURL != null && sourceMapURL !== '') {
      return this._processScriptParsedWithoutDownloadableUrl(obj, urlString);
    }
    return Promise.resolve(obj);
  }

  // Used to process `Debugger.scriptParsed` messages that have reported a `sourceMapURL` without
  // a corresponding `url`.
  async _processScriptParsedWithoutDownloadableUrl(
    obj: Object,
    urlString: string,
  ): Promise<Object> {
    const {params} = obj;
    const {scriptId} = params;
    const {result} = await this._getScriptSource(scriptId);
    const {scriptSource} = result;

    const filePath = await fsPromise.tempfile({suffix: '.js'});
    await fsPromise.writeFile(filePath, scriptSource);
    const nuclidePath = `file://${filePath}`;

    const newFileData: FileData = {
      nuclidePath,
      targetPath: urlString,
      sourceMapUrl: await getSourceMapFromDisk(scriptSource),
    };
    this._targetPathToFileData.set(newFileData.targetPath, newFileData);
    this._nuclidePathToFileData.set(newFileData.nuclidePath, newFileData);
    updateMessageObjWithFileData(obj, newFileData);
    return obj;
  }

  // Used to process `Debugger.scriptParsed` messages that have reported a `url` with an http:
  // prefix, indicating that we need to download our resources.
  async _processScriptParsedWithDownloadableUrl(obj: Object, urlString: string): Promise<Object> {
    const url = new URL(urlString);
    const fileData = this._targetPathToFileData.get(urlString);
    if (fileData != null) {
      updateMessageObjWithFileData(obj, fileData);
      return obj;
    }

    log(`FileCache got url: ${urlString}`);
    const localhostedUrl = urlString.replace(EMULATOR_LOCALHOST_ADDR, 'localhost');
    log(`Converted to: ${localhostedUrl}`);
    const fileResponse = await xfetch(localhostedUrl, {});
    const basename = nuclideUri.basename(url.pathname);
    const [contents, filePath] = await Promise.all([
      fileResponse.text(),
      fsPromise.tempfile({prefix: basename, suffix: '.js'}),
    ]);
    await fsPromise.writeFile(filePath, contents);
    const nuclidePath = `file://${filePath}`;

    const newFileData: FileData = {
      nuclidePath,
      targetPath: urlString,
      sourceMapUrl: await getSourceMapFromUrl(url, contents),
    };
    this._targetPathToFileData.set(newFileData.targetPath, newFileData);
    this._nuclidePathToFileData.set(newFileData.nuclidePath, newFileData);
    updateMessageObjWithFileData(obj, newFileData);
    return obj;
  }

  getUrlFromFilePath(filePath: string): string {
    const fileData = this._nuclidePathToFileData.get(filePath);
    if (fileData == null) {
      return filePath;
    }
    return fileData.targetPath;
  }

  async dispose(): Promise<void> {
    this._disposables.dispose();
  }
}

async function getSourceMapFromDisk(bundle: string): Promise<void | string> {
  const matches = SOURCE_MAP_REGEX.exec(bundle);
  if (matches == null) {
    return undefined;
  }
  // Handle source maps for the bundle.
  const sourceMapPath = matches[1];
  const sourceMap = await fsPromise.readFile(sourceMapPath);
  const base64SourceMap = new Buffer(sourceMap).toString('base64');
  return `${SOURCE_MAP_PREFIX}${base64SourceMap}`;
}

async function getSourceMapFromUrl(url: URL, bundle: string): Promise<void | string> {
  const matches = SOURCE_MAP_REGEX.exec(bundle);
  if (matches == null) {
    return undefined;
  }

  // Handle source maps for the bundle.
  const sourceMapUrl = `${url.origin}${matches[1]}`;
  const sourceMapResponse = await xfetch(
    sourceMapUrl.replace(EMULATOR_LOCALHOST_ADDR, 'localhost'),
    {},
  );
  const sourceMap = await sourceMapResponse.text();
  const base64SourceMap = new Buffer(sourceMap).toString('base64');
  return `${SOURCE_MAP_PREFIX}${base64SourceMap}`;
}

function updateMessageObjWithFileData(
  obj: {params: {url: string, sourceMapURL?: string}},
  fileData: FileData,
): void {
  obj.params.url = fileData.nuclidePath;
  obj.params.sourceMapURL = fileData.sourceMapUrl;
}
