'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileDiagnosticMessage} from '../../nuclide-diagnostics-common/lib/rpc-types';

import {Range} from 'atom';
import {compareMessagesByFile} from '../lib/paneUtils';

describe('compareMessagesByFile', () => {

  let fileAMsgA: FileDiagnosticMessage = (null: any);
  let fileAMsgB: FileDiagnosticMessage = (null: any);
  let fileAError: FileDiagnosticMessage = (null: any);
  let fileBMsgA: FileDiagnosticMessage = (null: any);

  beforeEach(() => {
    fileAMsgA = {
      filePath: '/foo/bar/baz.html',
      providerName: 'foo',
      range: new Range([0, 0], [1, 0]),
      scope: 'file',
      type: 'Warning',
    };
    fileAMsgB = {
      filePath: '/foo/bar/baz.html',
      providerName: 'foo',
      range: new Range([5, 0], [6, 0]),
      scope: 'file',
      type: 'Warning',
    };
    fileAError = {
      filePath: '/foo/bar/baz.html',
      providerName: 'foo',
      range: new Range([10, 0], [11, 0]),
      scope: 'file',
      type: 'Error',
    };
    fileBMsgA = {
      filePath: '/foo/bar/xyz.html',
      providerName: 'foo',
      range: new Range([3, 0], [4, 0]),
      scope: 'file',
      type: 'Warning',
    };
  });

  it('sorts messages based on file path', () => {
    const msgs = [fileBMsgA, fileAMsgA];
    expect(msgs.sort(compareMessagesByFile)).toEqual([fileAMsgA, fileBMsgA]);
  });

  it('sorts messages within a file based on line number', () => {
    const msgs = [fileAMsgB, fileAMsgA];
    expect(msgs.sort(compareMessagesByFile)).toEqual([fileAMsgA, fileAMsgB]);
  });

  it('sorts messages based on file path && by line number', () => {
    const msgs = [fileAMsgB, fileBMsgA, fileAMsgA];
    expect(msgs.sort(compareMessagesByFile)).toEqual([fileAMsgA, fileAMsgB, fileBMsgA]);
  });

  it('sorts messages based on level', () => {
    const msgs = [fileAMsgA, fileAMsgB, fileAError];
    expect(msgs.sort(compareMessagesByFile)).toEqual([fileAError, fileAMsgA, fileAMsgB]);
  });
});
