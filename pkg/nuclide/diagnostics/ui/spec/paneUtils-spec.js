'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Range} = require('atom');

var {compareMessagesByFile} = require('../lib/paneUtils');

describe('compareMessagesByFile', () => {

  var fileAMsgA: FileDiagnosticMessage;
  var fileAMsgB: FileDiagnosticMessage;
  var fileBMsgA: FileDiagnosticMessage;

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
    fileBMsgA = {
      filePath: '/foo/bar/xyz.html',
      providerName: 'foo',
      range: new Range([3, 0], [4, 0]),
      scope: 'file',
      type: 'Warning',
    };
  });

  it('sorts messages based on file path', () => {
    var msgs = [fileBMsgA, fileAMsgA];
    expect(msgs.sort(compareMessagesByFile)).toEqual([fileAMsgA, fileBMsgA]);
  });

  it('sorts messages within a file based on line number', () => {
    var msgs = [fileAMsgB, fileAMsgA];
    expect(msgs.sort(compareMessagesByFile)).toEqual([fileAMsgA, fileAMsgB]);
  });

  it('sorts messages based on file path && by line number', () => {
    var msgs = [fileAMsgB, fileBMsgA, fileAMsgA];
    expect(msgs.sort(compareMessagesByFile)).toEqual([fileAMsgA, fileAMsgB, fileBMsgA]);
  });

});
