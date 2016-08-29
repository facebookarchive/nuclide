'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Activation} from '../lib/main';
import {TextBuffer} from 'atom';
import {getBufferAtVersion, observeFileEvents} from '../../nuclide-open-files-rpc';
import {getFileVersionOfBuffer} from '../../nuclide-open-files-common';
import {Subject} from 'rxjs';

describe('nuclide-open-files', () => {
  let activation: Activation = (null: any);

  beforeEach(() => {
    activation = new Activation();
    activation.activate();
  });
  afterEach(() => {
    activation.dispose();
    activation = (null: any);
  });

  describe('observeFileEvents', () => {
    let finishEvents: () => Promise<Array<Object>> = (null: any);
    let eventCount: number = (null: any);

    beforeEach(() => {
      eventCount = 0;
      finishEvents = async () => [];
      const done = new Subject();
      const events = observeFileEvents()
        .map(event => {
          eventCount++;
          const result = {
            ...event,
            filePath: event.fileVersion.filePath,
            changeCount: event.fileVersion.version,
          };
          delete result.fileVersion;
          return result;
        }).takeUntil(done).toArray().toPromise();

      finishEvents = () => {
        done.next();
        done.complete();
        return events;
      };
    });

    it('open/close', () => {
      runs(() => {
        // simulates an open
        const buffer = new TextBuffer({filePath: 'f1', text: 'contents1'});
        atom.project.addBuffer(buffer);

        // close
        buffer.destroy();
      });
      waitsFor(() => eventCount >= 2);

      waitsForPromise(async () => {
        expect(await finishEvents()).toEqual([
          {
            kind: 'open',
            filePath: 'f1',
            changeCount: 1,
            contents: 'contents1',
          },
          {
            kind: 'close',
            filePath: 'f1',
            changeCount: 1,
          },
        ]);
      });
    });

    it('edit', () => {
      runs(() => {
        const buffer = new TextBuffer({filePath: 'f1', text: 'contents1'});
        atom.project.addBuffer(buffer);

        buffer.append('42');

        buffer.destroy();
      });
      waitsFor(() => eventCount >= 2);

      waitsForPromise(async () => {
        expect(await finishEvents()).toEqual([
          {
            kind: 'open',
            filePath: 'f1',
            changeCount: 1,
            contents: 'contents1',
          },
          {
            kind: 'edit',
            filePath: 'f1',
            changeCount: 2,
            oldRange: {
              start: {row: 0, column: 9},
              end: {row: 0, column: 9},
            },
            oldText: '',
            newRange: {
              start: {row: 0, column: 9},
              end: {row: 0, column: 11},
            },
            newText: '42',
          },
          {
            kind: 'close',
            filePath: 'f1',
            changeCount: 2,
          },
        ]);
      });
    });
    it('rename', () => {
      runs(() => {
        const buffer = new TextBuffer({filePath: 'f1', text: 'contents1'});
        atom.project.addBuffer(buffer);

        buffer.setPath('f2');

        buffer.destroy();
      });
      waitsFor(() => eventCount >= 4);

      waitsForPromise(async () => {
        expect(await finishEvents()).toEqual([
          {
            kind: 'open',
            filePath: 'f1',
            changeCount: 1,
            contents: 'contents1',
          },
          {
            kind: 'close',
            filePath: 'f1',
            changeCount: 1,
          },
          {
            kind: 'open',
            filePath: 'f2',
            changeCount: 1,
            contents: 'contents1',
          },
          {
            kind: 'close',
            filePath: 'f2',
            changeCount: 1,
          },
        ]);
      });
    });

    it('rename new file', () => {
      runs(() => {
        const buffer = new TextBuffer('contents1');
        atom.project.addBuffer(buffer);

        buffer.setPath('f2');

        buffer.destroy();
      });
      waitsFor(() => eventCount >= 2);

      waitsForPromise(async () => {
        expect(await finishEvents()).toEqual([
          {
            kind: 'open',
            filePath: 'f2',
            changeCount: 1,
            contents: 'contents1',
          },
          {
            kind: 'close',
            filePath: 'f2',
            changeCount: 1,
          },
        ]);
      });
    });
  });


  describe('getBufferAtVersion', () => {
    it('get current version', () => {
      waitsForPromise(async () => {
        const buffer = new TextBuffer({filePath: 'f1', text: 'contents1'});
        atom.project.addBuffer(buffer);

        const serverBuffer = await getBufferAtVersion(getFileVersionOfBuffer(buffer));
        expect(serverBuffer.getText()).toEqual('contents1');

        buffer.destroy();
      });
    });

    it('get next version', () => {
      waitsForPromise(async () => {
        const buffer = new TextBuffer({filePath: 'f1', text: 'contents1'});
        atom.project.addBuffer(buffer);

        const fileVersion = getFileVersionOfBuffer(buffer);
        fileVersion.version++;
        const serverBuffer = getBufferAtVersion(fileVersion);

        buffer.append('42');

        expect((await serverBuffer).getText()).toEqual('contents142');

        buffer.destroy();
      });
    });

    it('get out of date version', () => {
      waitsForPromise(async () => {
        const buffer = new TextBuffer({filePath: 'f1', text: 'contents1'});
        atom.project.addBuffer(buffer);

        const outdatedFileVersion = getFileVersionOfBuffer(buffer);

        buffer.append('42');
        await getBufferAtVersion(getFileVersionOfBuffer(buffer));

        let hadError = false;
        try {
          await getBufferAtVersion(outdatedFileVersion);
        } catch (e) {
          hadError = true;
        }

        expect(hadError).toBe(true);

        buffer.destroy();
      });
    });

    it('get version before file opens', () => {
      waitsForPromise(async () => {
        const serverBuffer = getBufferAtVersion({
          filePath: 'f3',
          version: 1,
        });

        const buffer = new TextBuffer({filePath: 'f3', text: 'contents3'});
        atom.project.addBuffer(buffer);

        expect((await serverBuffer).getText()).toEqual('contents3');

        buffer.destroy();
      });
    });

    it('get out of date version on open', () => {
      waitsForPromise(async () => {
        const serverBuffer = getBufferAtVersion({
          filePath: 'f3',
          version: 0,
        });

        const buffer = new TextBuffer({filePath: 'f3', text: 'contents1'});
        atom.project.addBuffer(buffer);

        let hadError = false;
        try {
          await serverBuffer;
        } catch (e) {
          hadError = true;
        }

        expect(hadError).toBe(true);

        buffer.destroy();
      });
    });

    it('get reopened file', () => {
      waitsForPromise(async () => {
        const buffer = new TextBuffer({filePath: 'f3', text: 'contents3'});
        atom.project.addBuffer(buffer);

        expect((await getBufferAtVersion(getFileVersionOfBuffer(buffer))).getText())
          .toEqual('contents3');

        const recievedClose = observeFileEvents()
          .filter(event => event.kind === 'close')
          .take(1)
          .toArray()
          .toPromise();
        buffer.destroy();
        await recievedClose;

        const buffer2 = new TextBuffer({filePath: 'f3', text: 'contents4'});
        atom.project.addBuffer(buffer2);

        expect((await getBufferAtVersion(getFileVersionOfBuffer(buffer2))).getText())
          .toEqual('contents4');

        buffer2.destroy();
      });
    });
  });
});
