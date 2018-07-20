/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 * @emails oncall+nuclide
 */
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import {FileCache} from '../lib/FileCache';
import {ConfigObserver} from '../lib/ConfigObserver';
import waitsFor from '../../../jest/waits_for';

describe('ConfigObserver', () => {
  let cache: FileCache = (null: any);
  let eventCount = 0;
  let events: Promise<Array<Array<NuclideUri>>> = (null: any);
  let findNearestFile: (path: NuclideUri) => Promise<?NuclideUri> = (null: any);

  const createOpen = filePath => ({
    kind: 'open',
    fileVersion: {
      notifier: cache,
      filePath,
      version: 1,
    },
    contents: 'contents1',
    languageId: 'Babel ES6 JavaScript',
  });

  const createClose = filePath => ({
    kind: 'close',
    fileVersion: {
      notifier: cache,
      filePath,
      version: 1,
    },
  });

  beforeEach(() => {
    cache = new FileCache();
    const observer = new ConfigObserver(cache, ['.php'], path =>
      findNearestFile(path),
    );

    eventCount = 0;
    events = observer
      .observeConfigs()
      .map(config => Array.from(config))
      .do(() => {
        eventCount++;
      })
      .toArray()
      .toPromise();
  });

  it('root project', async () => {
    findNearestFile = path => Promise.resolve(path);
    cache.onDirectoriesChanged(new Set(['/some/path']));
    await waitsFor(() => eventCount >= 2);

    cache.onDirectoriesChanged(new Set());
    await waitsFor(() => eventCount >= 3);

    // completes the observables.
    cache.dispose();
    // observer.dispose();

    expect(await events).toEqual([[], ['/some/path'], []]);
  });

  it('multiple root projects', async () => {
    findNearestFile = path => Promise.resolve(path);
    cache.onDirectoriesChanged(new Set(['/some/path', '/some/path2']));
    await waitsFor(() => eventCount >= 2);

    cache.onDirectoriesChanged(new Set(['/some/path2']));
    await waitsFor(() => eventCount >= 3);

    cache.onDirectoriesChanged(new Set());
    await waitsFor(() => eventCount >= 4);

    // completes the observables.
    cache.dispose();
    // observer.dispose();

    expect(await events).toEqual([
      [],
      ['/some/path', '/some/path2'],
      ['/some/path2'],
      [],
    ]);
  });

  it('opening a file in a root project', async () => {
    findNearestFile = path => Promise.resolve('/some/path');
    cache.onDirectoriesChanged(new Set(['/some/path']));
    await waitsFor(() => eventCount >= 2);

    cache.onFileEvent(createOpen('/some/path/file1.php'));
    cache.onFileEvent(createClose('/some/path/file1.php'));
    cache.onDirectoriesChanged(new Set());
    await waitsFor(() => eventCount >= 3);

    // completes the observables.
    cache.dispose();
    // observer.dispose();

    expect(await events).toEqual([[], ['/some/path'], []]);
  });

  it('opening a file without a project', async () => {
    findNearestFile = path => Promise.resolve('/some/path');
    cache.onFileEvent(createOpen('/some/path/file1.php'));
    await waitsFor(() => eventCount >= 2);

    cache.onFileEvent(createClose('/some/path/file1.php'));
    await waitsFor(() => eventCount >= 3);

    // completes the observables.
    cache.dispose();
    // observer.dispose();

    expect(await events).toEqual([[], ['/some/path'], []]);
  });
});
