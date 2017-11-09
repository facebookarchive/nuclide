/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {ClangRequestSettings} from '../../nuclide-clang-rpc/lib/rpc-types';
import type {HostServices} from '../../nuclide-language-service-rpc/lib/rpc-types';

import fs from 'nuclide-commons/fsPromise';
import os from 'os';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {
  MultiProjectLanguageService,
  forkHostServices,
} from '../../nuclide-language-service-rpc';
import {FileCache} from '../../nuclide-open-files-rpc';
import {Cache} from 'nuclide-commons/cache';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {LspLanguageService} from '../../nuclide-vscode-language-service-rpc/lib/LspLanguageService';

type ManagedRoot = {
  files: Set<string>,
  watchFile: string, // TODO: pelmers use this field, reset server when build file changes
  rootDir: string,
  tempCommandsDir: ?string,
};

export default class ClangdLanguageServer extends MultiProjectLanguageService<
  LspLanguageService,
> {
  // Maps clang settings => LanguageService
  // Remark: I don't key the cache on ClangRequestSettings
  // because === operator does not work as an equality check.
  _clangdProcesses: Cache<string, Promise<?LspLanguageService>>;
  _managedRoots: Map<string, ManagedRoot>;
  constructor(
    languageId: string,
    command: string,
    logger: log4js$Logger,
    fileCache: FileCache,
    host: HostServices,
  ) {
    super();

    this._resources = new UniversalDisposable();

    // TODO pelmers: For debugging
    this._logger = logger;
    const server = this; // Access class scope within closure.
    async function clangdServiceFactory(
      compileCommandsPath: string,
    ): Promise<?LspLanguageService> {
      const managedRoot = server._managedRoots.get(compileCommandsPath);
      if (!managedRoot) {
        return null;
      }
      const {rootDir, tempCommandsDir} = managedRoot;
      const args = [
        '-enable-snippets',
        // TODO pelmers For debugging:
        // '-debug',
        // '-input-mirror-file',
        // '/Users/pelmers/clangd.log',
        // '-run-synchronously',
      ];
      if (tempCommandsDir != null) {
        args.push('-compile-commands-dir', tempCommandsDir);
      }
      await server.hasObservedDiagnostics();
      const lsp = new LspLanguageService(
        logger,
        fileCache,
        await forkHostServices(host, logger),
        languageId,
        command,
        args,
        {}, // spawnOptions
        rootDir,
        ['.cpp', '.h', '.hpp'],
        {},
        5 * 60 * 1000, // 5 minutes
      );

      lsp.start(); // Kick off 'Initializing'...
      return lsp;
    }

    // Replaced by clangdProcesses below.
    this._processes = new Cache(async (x: any) => null, value => {});

    this._clangdProcesses = new Cache(clangdServiceFactory, value => {
      value.then(service => {
        if (service != null) {
          service.dispose();
        }
      });
    });

    this._managedRoots = new Map();

    this._resources.add(host, this._processes);
    this._resources.add(host, this._clangdProcesses);

    this._resources.add(() => {
      this._closeProcesses();
    });

    // Remove fileCache when the remote connection shuts down
    this._resources.add(
      fileCache
        .observeFileEvents()
        .ignoreElements()
        .subscribe(
          undefined, // TODO pelmers: watch saves on targets files
          undefined, // error
          () => {
            this._logger.info('fileCache shutting down.');
            this._closeProcesses();
          },
        ),
    );
  }

  // Add to a 'default' managed process that uses no default flags.
  _addDefaultRoot(flagsFile: string, projectRoot: ?string): boolean {
    if (this._managedRoots.has('.')) {
      return true;
    } else if (projectRoot != null) {
      this._logger.log('Creating defult process');
      this._managedRoots.set('.', {
        watchFile: flagsFile,
        rootDir: projectRoot,
        files: new Set(),
        tempCommandsDir: null,
      });
      this._clangdProcesses.get('.');
      return true;
    }
    return false;
  }

  async addClangRequest(clangRequest: ClangRequestSettings): Promise<boolean> {
    // TODO pelmers: refactor
    // Start new server for compile commands path and add to managed list.
    // Return whether successful.
    const {projectRoot} = clangRequest;
    const database = clangRequest.compilationDatabase;
    if (!database) {
      return false;
    }
    // file = compile commands, flags file = build target
    const {file, flagsFile} = database;
    if (flagsFile == null) {
      return false;
    }
    const rootDir = nuclideUri.dirname(flagsFile);
    if (file == null) {
      return this._addDefaultRoot(flagsFile, projectRoot);
    }
    // See https://clang.llvm.org/docs/JSONCompilationDatabase.html for spec
    // Add the files of this database to the managed map.
    if (this._managedRoots.has(file)) {
      return true;
    }
    const contents = await fs.readFile(file);
    // Create a temporary directory with only compile_commands.json because
    // clangd requires the name of a directory containing a
    // compile_commands.json, which is not always what we are provided here.
    const tmpDir = nuclideUri.join(
      os.tmpdir(),
      'nuclide-clangd-lsp-' + Math.random().toString(),
    );
    if (!await fs.mkdirp(tmpDir)) {
      return false;
    }
    const tmpCommandsPath = nuclideUri.join(tmpDir, 'compile_commands.json');
    await fs.writeFile(tmpCommandsPath, contents);
    this._managedRoots.set(file, {
      rootDir,
      watchFile: flagsFile,
      files: new Set(JSON.parse(contents.toString()).map(entry => entry.file)),
      tempCommandsDir: tmpDir,
    });
    this._logger.info(
      'Copied commands from ' + file + ' to ' + tmpCommandsPath,
    );
    // Trigger the factory to construct the server.
    this._clangdProcesses.get(file);
    return true;
  }

  async isFileKnown(filePath: NuclideUri): Promise<boolean> {
    return this.getClangRequestSettingsForFile(filePath) != null;
  }

  getClangRequestSettingsForFile(filePath: NuclideUri): ?string {
    const absPath = nuclideUri.getPath(filePath);
    this._logger.info('checking for ' + absPath);
    for (const [commandsPath, managedRoot] of this._managedRoots) {
      if (managedRoot.files.has(absPath)) {
        return commandsPath;
      }
    }
    return null;
  }

  async getLanguageServiceForFile(
    filePath: NuclideUri,
  ): Promise<?LspLanguageService> {
    const commandsPath = this.getClangRequestSettingsForFile(filePath);
    if (commandsPath != null) {
      this._logger.info('Found existing service for ' + filePath);
      this._logger.info('Key: ' + commandsPath);
      return this._clangdProcesses.get(commandsPath);
    }
    this._logger.info(
      ' if path is reasonable then i should have created server for it already?',
    );
    // Give back the default.
    return this._clangdProcesses.get('.');
  }

  dispose() {
    super.dispose();
    for (const managedRoot of this._managedRoots.values()) {
      const {tempCommandsDir} = managedRoot;
      if (tempCommandsDir != null) {
        // Make sure the temp dir has exactly 1 file, then remove it.
        fs.readdir(tempCommandsDir).then(paths => {
          if (paths.length === 1) {
            fs.rmdir(tempCommandsDir);
          }
        });
      }
    }
  }
}
