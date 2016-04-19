'use babel';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable no-console*/

const Module = require('module');
const profileRequireTime = require('./profile-require-time');

exports.init = function(options = {}) {
  // Load expensive libs so we don't skew the results.
  if (options.preloadExpensive) {
    require('@reactivex/rxjs');
    require('react-for-atom').React;
    require('react-for-atom').ReactDOM;
  }

  const byRoot = Boolean(options.byRoot);
  const byLoadOrder = Boolean(options.byLoadOrder);
  const loadOrderMinDuration = parseInt(options.loadOrderMinDuration, 10) || 0;

  profileRequireTime.start();

  const onNuclideActivate = atom.packages.onDidActivatePackage(pack => {
    if (pack.name === 'nuclide') {
      onNuclideActivate.dispose();
      console.log('Nuclide ready time: %sms',  pack.activateTime + pack.loadTime);
      const profile = profileRequireTime.stop();
      if (byLoadOrder) {
        printByLoadOrder(profile, loadOrderMinDuration);
      }
      if (byRoot) {
        printByRoot(profile);
      }
    }
  });
};

function printByLoadOrder({data, startTime, stopTime}, minDuration) {
  console.groupCollapsed('Nuclide requires by load order');
  const table = [['order', 'ms', 'depth:filename']];
  data
    .filter(entry => entry.duration >= minDuration)
    .forEach(entry => {
      const shortName = entry.filename.replace(entry.basedir, '');
      table.push([
        entry.order,
        entry.duration + 'ms',
        entry.depth + ':' + leftTruncate(shortName, 70),
      ]);
    });
  console.log(
    toTable(table),
    `(${data.length} modules required during ${stopTime - startTime}ms)`
  );
  console.groupEnd();
}

function printByRoot({data, startTime, stopTime}) {
  const dataByFilename = {};
  data.forEach(entry => { dataByFilename[entry.filename] = entry; });

  console.groupCollapsed('Nuclide requires by root');
  data
    .filter(entry => {
      const _module = Module._cache[entry.filename];
      const parentFilename = _module.parent.filename;
      return !parentFilename.startsWith(entry.basedir) ||
             parentFilename === module.parent.filename;
    })
    .forEach(rootEntry => {
      console.group(rootEntry.filename.replace(rootEntry.basedir, ''));
      const table = [['order', 'ms', 'depth:filename']];
      (function traverse(filename) {
        const _entry = dataByFilename[filename];
        const shortName = _entry.filename.replace(_entry.basedir, '');
        table.push([
          _entry.order,
          _entry.duration + 'ms',
          _entry.depth + ':' + leftTruncate(shortName, 70),
        ]);
        Module._cache[filename].children.forEach(child => {
          if (child.filename.startsWith(rootEntry.basedir)) {
            traverse(child.filename);
          }
        });
      })(rootEntry.filename);
      console.log(toTable(table));
      console.groupEnd();
    });
  console.groupEnd();
}

function leftTruncate(str, maxLength) {
  return str.length <= maxLength ? str : '…' + str.substr(-maxLength);
}

function toTable(rows) {
  const maxWidths = [];
  rows.forEach(row => {
    row.forEach((item, i) => {
      maxWidths[i] = Math.max(maxWidths[i] || 0, String(item).length);
    });
  });

  let lines = '';
  rows.forEach(row => {
    row.forEach((item, i) => {
      const padlen = Math.max(maxWidths[i] - String(item).length + 2, 0);
      lines += String(item) + ' '.repeat(padlen);
    });
    lines += '\n';
  });

  return lines;
}
