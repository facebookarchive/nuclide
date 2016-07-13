
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable no-console*/

var Module = require('module');
var profileRequireTime = require('./profile-require-time');

exports.init = function () {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var byRoot = Boolean(options.byRoot);
  var byLoadOrder = Boolean(options.byLoadOrder);
  var loadOrderMinDuration = parseInt(options.loadOrderMinDuration, 10) || 0;

  profileRequireTime.start();

  var onNuclideActivate = atom.packages.onDidActivatePackage(function (pack) {
    if (pack.name === 'nuclide') {
      onNuclideActivate.dispose();
      console.log('Nuclide ready time: %sms', pack.activateTime + pack.loadTime);
      var profile = profileRequireTime.stop();
      if (byLoadOrder) {
        printByLoadOrder(profile, loadOrderMinDuration);
      }
      if (byRoot) {
        printByRoot(profile);
      }
    }
  });
};

function printByLoadOrder(_ref, minDuration) {
  var data = _ref.data;
  var startTime = _ref.startTime;
  var stopTime = _ref.stopTime;

  console.groupCollapsed('Nuclide requires by load order');
  var table = [['order', 'init', 'total', 'depth:filename']];
  Object.keys(data).filter(function (filename) {
    return data[filename].total >= minDuration;
  }).sort(function (a, b) {
    return data[a].order - data[b].order;
  }).forEach(function (filename) {
    var entry = data[filename];
    var shortName = entry.filename.replace(entry.basedir, '');
    table.push([entry.order, entry.init.toFixed(2) + 'ms', entry.total.toFixed(2) + 'ms', entry.depth + ':' + leftTruncate(shortName, 70) + (entry.deferred ? '' : '*')]);
  });
  console.log(toTable(table), '(' + Object.keys(data).length + ' modules required during ' + (stopTime - startTime) + 'ms)');
  console.groupEnd();
}

function printByRoot(_ref2) {
  var data = _ref2.data;
  var startTime = _ref2.startTime;
  var stopTime = _ref2.stopTime;

  console.groupCollapsed('Nuclide requires by root');
  Object.keys(data).filter(function (filename) {
    var entry = data[filename];
    var parentFilename = Module._cache[filename].parent.filename;
    return !parentFilename.startsWith(entry.basedir) || parentFilename === module.parent.filename;
  }).sort(function (a, b) {
    return data[a].order - data[b].order;
  }).forEach(function (rootFilename) {
    var rootEntry = data[rootFilename];
    console.group(rootEntry.filename.replace(rootEntry.basedir, ''));
    var table = [['order', 'init', 'total', 'depth:filename']];
    (function traverse(filename) {
      var _entry = data[filename];
      var shortName = _entry.filename.replace(_entry.basedir, '');
      table.push([_entry.order, _entry.init.toFixed(2) + 'ms', _entry.total.toFixed(2) + 'ms', _entry.depth + ':' + leftTruncate(shortName, 70) + (_entry.deferred ? '' : '*')]);
      Module._cache[filename].children.forEach(function (child) {
        if (child.filename.startsWith(rootEntry.basedir)) {
          traverse(child.filename);
        }
      });
    })(rootEntry.filename);
    console.log(toTable(table));
    console.groupEnd();
  });
  console.log('(' + Object.keys(data).length + ' modules required during ' + (stopTime - startTime) + 'ms)');
  console.groupEnd();
}

function leftTruncate(str, maxLength) {
  return str.length <= maxLength ? str : '…' + str.substr(-maxLength);
}

function toTable(rows) {
  var maxWidths = [];
  rows.forEach(function (row) {
    row.forEach(function (item, i) {
      maxWidths[i] = Math.max(maxWidths[i] || 0, String(item).length);
    });
  });

  var lines = '';
  rows.forEach(function (row) {
    row.forEach(function (item, i) {
      var padlen = Math.max(maxWidths[i] - String(item).length + 2, 0);
      lines += String(item) + ' '.repeat(padlen);
    });
    lines += '\n';
  });

  return lines;
}