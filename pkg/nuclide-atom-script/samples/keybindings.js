Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

exports['default'] = _asyncToGenerator(function* (args) {
  var commands = [];
  for (var keybinding of atom.keymaps.getKeyBindings()) {
    commands.push(keybinding.command);
  }

  commands.sort();
  commands.forEach(function (command) {
    return console.log(command);
  }); // eslint-disable-line no-console
  return 0;
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtleWJpbmRpbmdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3VDQWFlLFdBQTBCLElBQW1CLEVBQXFCO0FBQy9FLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNwQixPQUFLLElBQU0sVUFBVSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDdEQsWUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDbkM7O0FBRUQsVUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2hCLFVBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPO1dBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7R0FBQSxDQUFDLENBQUM7QUFDbEQsU0FBTyxDQUFDLENBQUM7Q0FDViIsImZpbGUiOiJrZXliaW5kaW5ncy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtFeGl0Q29kZX0gZnJvbSAnLi4nO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBydW5Db21tYW5kKGFyZ3M6IEFycmF5PHN0cmluZz4pOiBQcm9taXNlPEV4aXRDb2RlPiB7XG4gIGNvbnN0IGNvbW1hbmRzID0gW107XG4gIGZvciAoY29uc3Qga2V5YmluZGluZyBvZiBhdG9tLmtleW1hcHMuZ2V0S2V5QmluZGluZ3MoKSkge1xuICAgIGNvbW1hbmRzLnB1c2goa2V5YmluZGluZy5jb21tYW5kKTtcbiAgfVxuXG4gIGNvbW1hbmRzLnNvcnQoKTtcbiAgY29tbWFuZHMuZm9yRWFjaChjb21tYW5kID0+IGNvbnNvbGUubG9nKGNvbW1hbmQpKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gIHJldHVybiAwO1xufVxuIl19