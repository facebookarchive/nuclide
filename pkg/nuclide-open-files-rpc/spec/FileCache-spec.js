'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {FileCache} from '../lib/FileCache';

function bufferToObject(buffer: atom$TextBuffer): Object {
  return {
    text: buffer.getText(),
    changeCount: buffer.changeCount,
  };
}

function cacheToObject(cache: FileCache): Object {
  const result = {};
  cache._buffers.forEach((buffer, filePath) => {
    result[filePath] = bufferToObject(buffer);
  });
  return result;
}

const cache = new FileCache();

describe('FileCache', () => {
  it('open', () => {
    cache.onEvent({
      kind: 'open',
      fileVersion: {
        filePath: 'f1',
        version: 3,
      },
      contents: 'contents1',
    });
    expect(cacheToObject(cache)).toEqual({
      f1: {
        text: 'contents1',
        changeCount: 3,
      },
    });
  });
  it('open/close', () => {
    cache.onEvent({
      kind: 'open',
      fileVersion: {
        filePath: 'f1',
        version: 3,
      },
      contents: 'contents1',
    });
    cache.onEvent({
      kind: 'close',
      fileVersion: {
        filePath: 'f1',
        version: 3,
      },
    });
    expect(cacheToObject(cache)).toEqual({});
  });
  it('edit', () => {
    cache.onEvent({
      kind: 'open',
      fileVersion: {
        filePath: 'f1',
        version: 3,
      },
      contents: 'contents1',
    });
    cache.onEvent({
      kind: 'edit',
      fileVersion: {
        filePath: 'f1',
        version: 4,
      },
      oldRange: {
        start: {row: 0, column: 3},
        end: {row: 0, column: 6},
      },
      oldText: 'ten',
      newRange: {
        start: {row: 0, column: 3},
        end: {row: 0, column: 9},
      },
      newText: 'eleven',
    });
  });
  it('sync closed file', () => {
    cache.onEvent({
      kind: 'sync',
      fileVersion: {
        filePath: 'f2',
        version: 4,
      },
      contents: 'contents12',
    });
    expect(cacheToObject(cache)).toEqual({
      f2: {
        text: 'contents12',
        changeCount: 4,
      },
    });
  });
  it('sync opened file', () => {
    cache.onEvent({
      kind: 'open',
      fileVersion: {
        filePath: 'f2',
        version: 42,
      },
      contents: 'blip',
    });
    cache.onEvent({
      kind: 'sync',
      fileVersion: {
        filePath: 'f2',
        version: 4,
      },
      contents: 'contents12',
    });
    expect(cacheToObject(cache)).toEqual({
      f2: {
        text: 'contents12',
        changeCount: 4,
      },
    });
  });

  // Unexpected Operations Should Throw
  it('open existing file', () => {
    cache.onEvent({
      kind: 'open',
      fileVersion: {
        filePath: 'f1',
        version: 3,
      },
      contents: 'contents1',
    });
    expect(() => {
      cache.onEvent({
        kind: 'open',
        fileVersion: {
          filePath: 'f1',
          version: 3,
        },
        contents: 'contents1',
      });
    }).toThrow();
  });
  it('close non-existing file', () => {
    expect(() => {
      cache.onEvent({
        kind: 'close',
        fileVersion: {
          filePath: 'f1',
          version: 3,
        },
      });
    }).toThrow();
  });
  it('edit closed file', () => {
    expect(() => {
      cache.onEvent({
        kind: 'edit',
        fileVersion: {
          filePath: 'f1',
          version: 4,
        },
        oldRange: {
          start: {row: 0, column: 3},
          end: {row: 0, column: 6},
        },
        oldText: 'ten',
        newRange: {
          start: {row: 0, column: 3},
          end: {row: 0, column: 9},
        },
        newText: 'eleven',
      });
    }).toThrow();
  });
  it('edit with non-sequential version', () => {
    cache.onEvent({
      kind: 'open',
      fileVersion: {
        filePath: 'f1',
        version: 3,
      },
      contents: 'contents1',
    });
    expect(() => {
      cache.onEvent({
        kind: 'edit',
        fileVersion: {
          filePath: 'f1',
          version: 5,
        },
        oldRange: {
          start: {row: 0, column: 3},
          end: {row: 0, column: 6},
        },
        oldText: 'ten',
        newRange: {
          start: {row: 0, column: 3},
          end: {row: 0, column: 9},
        },
        newText: 'eleven',
      });
    }).toThrow();
  });
  it('edit with incorrect oldText', () => {
    cache.onEvent({
      kind: 'open',
      fileVersion: {
        filePath: 'f1',
        version: 3,
      },
      contents: 'contents1',
    });
    expect(() => {
      cache.onEvent({
        kind: 'edit',
        fileVersion: {
          filePath: 'f1',
          version: 4,
        },
        oldRange: {
          start: {row: 0, column: 3},
          end: {row: 0, column: 6},
        },
        oldText: 'one',
        newRange: {
          start: {row: 0, column: 3},
          end: {row: 0, column: 9},
        },
        newText: 'eleven',
      });
    }).toThrow();
  });

  afterEach(() => {
    cache.dispose();
  });
});
