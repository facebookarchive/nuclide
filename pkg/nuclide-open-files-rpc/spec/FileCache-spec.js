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

describe('FileCache', () => {
  let cache: FileCache = (null: any);
  beforeEach(() => {
    cache = new FileCache();
  });

  async function getFileContentsByVersion(filePath, changeCount): Promise<string> {
    return (await cache.getBufferAtVersion({filePath, version: changeCount})).getText();
  }

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

  // getBufferAtVersion
  it('getBufferAtVersion on current version', () => {
    waitsForPromise(async () => {
      cache.onEvent({
        kind: 'open',
        fileVersion: {
          filePath: 'f1',
          version: 3,
        },
        contents: 'contents1',
      });
      const result = await getFileContentsByVersion('f1', 3);
      expect(result).toBe('contents1');
    });
  });
  it('getBufferAtVersion on out of date version', () => {
    waitsForPromise(async () => {
      cache.onEvent({
        kind: 'open',
        fileVersion: {
          filePath: 'f1',
          version: 3,
        },
        contents: 'contents1',
      });
      let hadError = false;
      try {
        await getFileContentsByVersion('f1', 2);
      } catch (e) {
        hadError = true;
      }
      expect(hadError).toBe(true);
    });
  });
  it('getBufferAtVersion on next version', () => {
    waitsForPromise(async () => {
      cache.onEvent({
        kind: 'open',
        fileVersion: {
          filePath: 'f1',
          version: 3,
        },
        contents: 'contents1',
      });
      const result = getFileContentsByVersion('f1', 4);
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
      const value = await result;
      expect(value).toBe('conelevents1');
    });
  });
  it('getBufferAtVersion before open', () => {
    waitsForPromise(async () => {
      const result = getFileContentsByVersion('f1', 3);
      cache.onEvent({
        kind: 'open',
        fileVersion: {
          filePath: 'f1',
          version: 3,
        },
        contents: 'contents1',
      });
      const value = await result;
      expect(value).toBe('contents1');
    });
  });
  it('getBufferAtVersion on out of date version before open', () => {
    const result = getFileContentsByVersion('f1', 2);
    waitsForPromise(async () => {
      cache.onEvent({
        kind: 'open',
        fileVersion: {
          filePath: 'f1',
          version: 3,
        },
        contents: 'contents1',
      });
      let hadError = false;
      try {
        await result;
      } catch (e) {
        hadError = true;
      }
      expect(hadError).toBe(true);
    });
  });
  it('getBufferAtVersion on sync open', () => {
    waitsForPromise(async () => {
      const result = getFileContentsByVersion('f1', 3);
      cache.onEvent({
        kind: 'sync',
        fileVersion: {
          filePath: 'f1',
          version: 3,
        },
        contents: 'contents1',
      });
      const value = await result;
      expect(value).toBe('contents1');
    });
  });
  it('getBufferAtVersion on sync edit', () => {
    waitsForPromise(async () => {
      const result = getFileContentsByVersion('f1', 6);
      cache.onEvent({
        kind: 'open',
        fileVersion: {
          filePath: 'f1',
          version: 3,
        },
        contents: 'contents1',
      });
      cache.onEvent({
        kind: 'sync',
        fileVersion: {
          filePath: 'f1',
          version: 6,
        },
        contents: 'contents6',
      });
      const value = await result;
      expect(value).toBe('contents6');
    });
  });
  it('getBufferAtVersion on reopened file', () => {
    waitsForPromise(async () => {
      const result1 = getFileContentsByVersion('f1', 3);
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
      const result2 = getFileContentsByVersion('f1', 3);
      cache.onEvent({
        kind: 'open',
        fileVersion: {
          filePath: 'f1',
          version: 3,
        },
        contents: 'contents-reopened',
      });
      expect(await result1).toBe('contents1');
      expect(await result2).toBe('contents-reopened');
    });
  });

  afterEach(() => {
    cache.dispose();
    cache = (null: any);
  });
});
