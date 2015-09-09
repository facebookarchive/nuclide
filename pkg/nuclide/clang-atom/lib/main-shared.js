'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This shared code exists to workaround a race condition where we cannot be sure
 * whether the linter package or this package is activated first. If/when linter
 * moves to the Services API, then this can go away.
 */
var libClangProcess;

function setSharedLibClangProcess(libClangProcessSingleton: LibClangProcess) {
  libClangProcess = libClangProcessSingleton;
}

function getSharedLibClangProcess(): ?LibClangProcess {
  return libClangProcess;
}

module.exports = {
  setSharedLibClangProcess,
  getSharedLibClangProcess,
};
