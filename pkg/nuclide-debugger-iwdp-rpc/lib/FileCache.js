'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
  filePath: string, // Path to file on disk.
  url: string, // Url bundle is served from.
  sourceMapUrl?: string, // Url that chrome devtools understands and can decode to get source maps.
};

type Url = string;

const SOURCE_MAP_REGEX = /\/\/# sourceMappingURL=(.+)$/;
const SOURCE_MAP_PREFIX = 'data:application/json;base64,';

export class FileCache {
  _disposables: UniversalDisposable;
  _filePathToFileData: Map<Url, FileData>;
  _urlToFileData: Map<Url, FileData>;

  constructor() {
    this._filePathToFileData = new Map();
    this._urlToFileData = new Map();
    this._disposables = new UniversalDisposable(
      () => this._filePathToFileData.clear(),
      () => this._urlToFileData.clear(),
    );
  }

  async scriptParsed(obj: Object): Promise<Object> {
    const {params} = obj;
    if (params == null) {
      return obj;
    }
    const {url: urlString} = params;
    if (urlString == null || urlString === '') {
      return obj;
    }
    if (!urlString.startsWith('http:')) {
      return obj;
    }
    const url = new URL(urlString);
    const fileData = this._urlToFileData.get(urlString);
    if (fileData != null) {
      updateMessageObjWithFileData(obj, fileData);
      return obj;
    }
    const newFileData = await createFileData(url);
    this._urlToFileData.set(newFileData.url, newFileData);
    this._filePathToFileData.set(newFileData.filePath, newFileData);
    updateMessageObjWithFileData(obj, newFileData);
    return obj;
  }

  getUrlFromFilePath(filePath: string): string {
    const fileData = this._filePathToFileData.get(filePath);
    if (fileData == null) {
      return filePath;
    }
    return fileData.url;
  }

  async dispose(): Promise<void> {
    this._disposables.dispose();
  }
}

async function createFileData(url: URL): Promise<FileData> {
  // Handle the bundle file.
  log(`FileCache got url: ${url.toString()}`);
  const localhostedUrl = url.toString().replace(EMULATOR_LOCALHOST_ADDR, 'localhost');
  log(`Converted to: ${localhostedUrl}`);
  const fileResponse = await xfetch(localhostedUrl, {});
  const basename = nuclideUri.basename(url.pathname);
  const [fileText, filePath] = await Promise.all([
    fileResponse.text(),
    fsPromise.tempfile({prefix: basename, suffix: '.js'}),
  ]);
  await fsPromise.writeFile(filePath, fileText);
  const fileSystemUrl = `file://${filePath}`;

  const matches = SOURCE_MAP_REGEX.exec(fileText);
  if (matches == null) {
    return {
      filePath: fileSystemUrl,
      url: url.toString(),
    };
  }

  // Handle source maps for the bundle.
  const sourceMapUrl = `${url.origin}${matches[1]}`;
  const sourceMapResponse = await xfetch(
    sourceMapUrl.replace(EMULATOR_LOCALHOST_ADDR, 'localhost'),
    {},
  );
  const sourceMap = await sourceMapResponse.text();
  const base64SourceMap = new Buffer(sourceMap).toString('base64');
  return {
    filePath: fileSystemUrl,
    url: url.toString(),
    sourceMapUrl: `${SOURCE_MAP_PREFIX}${base64SourceMap}`,
  };
}

function updateMessageObjWithFileData(
  obj: {params: {url: string, sourceMapURL?: string}},
  fileData: FileData,
): void {
  obj.params.url = fileData.filePath;
  obj.params.sourceMapURL = fileData.sourceMapUrl;
}
