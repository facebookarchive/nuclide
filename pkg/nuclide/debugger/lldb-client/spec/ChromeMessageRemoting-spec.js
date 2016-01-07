'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


const {translateMessageFromServer, translateMessageToServer} = require('../lib/ChromeMessageRemoting');

describe('debugger-hhvm ChromeMessageRemoting', () => {

  it('translateMessageFromServer', () => {
    expect(translateMessageFromServer(
        'myhost',
        8080,
        JSON.stringify({
          method: 'Debugger.scriptParsed',
          params: {
            scriptId: '/home/test.php',
            url: 'file:///home/test.php',
            startLine:0,
            startColumn:0,
            endLine:0,
            endColumn:0,
          },
        }))).toBe(JSON.stringify({
          method: 'Debugger.scriptParsed',
          params: {
            scriptId: '/home/test.php',
            url: 'nuclide://myhost:8080/home/test.php',
            startLine:0,
            startColumn:0,
            endLine:0,
            endColumn:0,
          },
        }));
  });

  it('translateMessageFromServer with space', () => {
    expect(translateMessageFromServer(
        'myhost',
        8080,
        JSON.stringify({
          method: 'Debugger.scriptParsed',
          params: {
            scriptId: '/home/te st.php',
            url: 'file:///home/te st.php',
            startLine:0,
            startColumn:0,
            endLine:0,
            endColumn:0,
          },
        }))).toBe(JSON.stringify({
          method: 'Debugger.scriptParsed',
          params: {
            scriptId: '/home/te st.php',
            url: 'nuclide://myhost:8080/home/te st.php',
            startLine:0,
            startColumn:0,
            endLine:0,
            endColumn:0,
          },
        }));
  });

  it('translateMessageToServer', () => {
    expect(translateMessageToServer(
        JSON.stringify({
          method: 'Debugger.setBreakpointByUrl',
          params: {
            lineNumber: 3,
            url: 'nuclide://myhost:8080/home/test.php',
            columnNumber: 0,
            condition: '',
          },
        }))).toBe(JSON.stringify({
          method: 'Debugger.setBreakpointByUrl',
          params: {
            lineNumber: 3,
            url: 'file:///home/test.php',
            columnNumber: 0,
            condition: '',
          },
        }));
  });

});
