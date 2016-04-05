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

var getLineNumberForTag = _asyncToGenerator(function* (tag) {
  var lineNumber = tag.lineNumber;
  var pattern = tag.pattern;

  if (lineNumber) {
    lineNumber--; // ctags line numbers start at 1
  } else if (pattern != null) {
      // ctags does not escape regexps properly.
      // However, it should never create anything beyond /x/ or /^x$/.
      var exactMatch = false;
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        pattern = pattern.substr(1, pattern.length - 2);
        if (pattern.startsWith('^') && pattern.endsWith('$')) {
          pattern = pattern.substr(1, pattern.length - 2);
          exactMatch = true;
        }
      }
      try {
        // Search for the pattern in the file.
        var service = (0, _nuclideRemoteConnection.getServiceByNuclideUri)('FileSystemService', tag.file);
        (0, _assert2['default'])(service);
        var contents = yield service.readFile((0, _nuclideRemoteUri.getPath)(tag.file));
        var lines = contents.toString('utf8').split('\n');
        lineNumber = 0;
        for (var i = 0; i < lines.length; i++) {
          if (exactMatch ? lines[i] === pattern : lines[i].indexOf(pattern) !== -1) {
            lineNumber = i;
            break;
          }
        }
      } catch (e) {
        (0, _nuclideLogging.getLogger)().warn('nuclide-remote-ctags: Could not locate pattern in ' + tag.file, e);
      }
    }

  return lineNumber;
});

exports.getLineNumberForTag = getLineNumberForTag;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideLogging = require('../../nuclide-logging');

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

// Taken from http://ctags.sourceforge.net/FORMAT
var CTAGS_KIND_NAMES = {
  c: 'class',
  d: 'define',
  e: 'enum',
  f: 'function',
  F: 'file',
  g: 'enum',
  m: 'member',
  p: 'function',
  s: 'struct',
  t: 'typedef',
  u: 'union',
  v: 'var'
};

exports.CTAGS_KIND_NAMES = CTAGS_KIND_NAMES;
var CTAGS_KIND_ICONS = {
  c: 'icon-code',
  d: 'icon-quote',
  e: 'icon-quote',
  f: 'icon-zap',
  F: 'icon-file-binary',
  g: 'icon-quote',
  m: 'icon-zap',
  p: 'icon-zap',
  s: 'icon-code',
  t: 'icon-tag',
  u: 'icon-code',
  v: 'icon-code'
};

exports.CTAGS_KIND_ICONS = CTAGS_KIND_ICONS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQWlEc0IsbUJBQW1CLHFCQUFsQyxXQUFtQyxHQUFnQixFQUFtQjtNQUN0RSxVQUFVLEdBQWEsR0FBRyxDQUExQixVQUFVO01BQUUsT0FBTyxHQUFJLEdBQUcsQ0FBZCxPQUFPOztBQUN4QixNQUFJLFVBQVUsRUFBRTtBQUNkLGNBQVUsRUFBRSxDQUFDO0dBQ2QsTUFBTSxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7OztBQUcxQixVQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFDdkIsVUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDcEQsZUFBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEQsWUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDcEQsaUJBQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hELG9CQUFVLEdBQUcsSUFBSSxDQUFDO1NBQ25CO09BQ0Y7QUFDRCxVQUFJOztBQUVGLFlBQU0sT0FBTyxHQUFHLHFEQUF1QixtQkFBbUIsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEUsaUNBQVUsT0FBTyxDQUFDLENBQUM7QUFDbkIsWUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLCtCQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNELFlBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BELGtCQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckMsY0FBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ3hFLHNCQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ2Ysa0JBQU07V0FDUDtTQUNGO09BQ0YsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLHdDQUFXLENBQUMsSUFBSSx3REFBc0QsR0FBRyxDQUFDLElBQUksRUFBSSxDQUFDLENBQUMsQ0FBQztPQUN0RjtLQUNGOztBQUVELFNBQU8sVUFBVSxDQUFDO0NBQ25COzs7Ozs7OztzQkF0RXFCLFFBQVE7Ozs7OEJBQ04sdUJBQXVCOzt1Q0FDVixpQ0FBaUM7O2dDQUNoRCwwQkFBMEI7OztBQUd6QyxJQUFNLGdCQUFnQixHQUFHO0FBQzlCLEdBQUMsRUFBRSxPQUFPO0FBQ1YsR0FBQyxFQUFFLFFBQVE7QUFDWCxHQUFDLEVBQUUsTUFBTTtBQUNULEdBQUMsRUFBRSxVQUFVO0FBQ2IsR0FBQyxFQUFFLE1BQU07QUFDVCxHQUFDLEVBQUUsTUFBTTtBQUNULEdBQUMsRUFBRSxRQUFRO0FBQ1gsR0FBQyxFQUFFLFVBQVU7QUFDYixHQUFDLEVBQUUsUUFBUTtBQUNYLEdBQUMsRUFBRSxTQUFTO0FBQ1osR0FBQyxFQUFFLE9BQU87QUFDVixHQUFDLEVBQUUsS0FBSztDQUNULENBQUM7OztBQUVLLElBQU0sZ0JBQWdCLEdBQUc7QUFDOUIsR0FBQyxFQUFFLFdBQVc7QUFDZCxHQUFDLEVBQUUsWUFBWTtBQUNmLEdBQUMsRUFBRSxZQUFZO0FBQ2YsR0FBQyxFQUFFLFVBQVU7QUFDYixHQUFDLEVBQUUsa0JBQWtCO0FBQ3JCLEdBQUMsRUFBRSxZQUFZO0FBQ2YsR0FBQyxFQUFFLFVBQVU7QUFDYixHQUFDLEVBQUUsVUFBVTtBQUNiLEdBQUMsRUFBRSxXQUFXO0FBQ2QsR0FBQyxFQUFFLFVBQVU7QUFDYixHQUFDLEVBQUUsV0FBVztBQUNkLEdBQUMsRUFBRSxXQUFXO0NBQ2YsQ0FBQyIsImZpbGUiOiJ1dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtDdGFnc1Jlc3VsdH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY3RhZ3MtYmFzZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcbmltcG9ydCB7Z2V0UGF0aH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuLy8gVGFrZW4gZnJvbSBodHRwOi8vY3RhZ3Muc291cmNlZm9yZ2UubmV0L0ZPUk1BVFxuZXhwb3J0IGNvbnN0IENUQUdTX0tJTkRfTkFNRVMgPSB7XG4gIGM6ICdjbGFzcycsXG4gIGQ6ICdkZWZpbmUnLFxuICBlOiAnZW51bScsXG4gIGY6ICdmdW5jdGlvbicsXG4gIEY6ICdmaWxlJyxcbiAgZzogJ2VudW0nLFxuICBtOiAnbWVtYmVyJyxcbiAgcDogJ2Z1bmN0aW9uJyxcbiAgczogJ3N0cnVjdCcsXG4gIHQ6ICd0eXBlZGVmJyxcbiAgdTogJ3VuaW9uJyxcbiAgdjogJ3ZhcicsXG59O1xuXG5leHBvcnQgY29uc3QgQ1RBR1NfS0lORF9JQ09OUyA9IHtcbiAgYzogJ2ljb24tY29kZScsXG4gIGQ6ICdpY29uLXF1b3RlJyxcbiAgZTogJ2ljb24tcXVvdGUnLFxuICBmOiAnaWNvbi16YXAnLFxuICBGOiAnaWNvbi1maWxlLWJpbmFyeScsXG4gIGc6ICdpY29uLXF1b3RlJyxcbiAgbTogJ2ljb24temFwJyxcbiAgcDogJ2ljb24temFwJyxcbiAgczogJ2ljb24tY29kZScsXG4gIHQ6ICdpY29uLXRhZycsXG4gIHU6ICdpY29uLWNvZGUnLFxuICB2OiAnaWNvbi1jb2RlJyxcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRMaW5lTnVtYmVyRm9yVGFnKHRhZzogQ3RhZ3NSZXN1bHQpOiBQcm9taXNlPG51bWJlcj4ge1xuICBsZXQge2xpbmVOdW1iZXIsIHBhdHRlcm59ID0gdGFnO1xuICBpZiAobGluZU51bWJlcikge1xuICAgIGxpbmVOdW1iZXItLTsgLy8gY3RhZ3MgbGluZSBudW1iZXJzIHN0YXJ0IGF0IDFcbiAgfSBlbHNlIGlmIChwYXR0ZXJuICE9IG51bGwpIHtcbiAgICAvLyBjdGFncyBkb2VzIG5vdCBlc2NhcGUgcmVnZXhwcyBwcm9wZXJseS5cbiAgICAvLyBIb3dldmVyLCBpdCBzaG91bGQgbmV2ZXIgY3JlYXRlIGFueXRoaW5nIGJleW9uZCAveC8gb3IgL154JC8uXG4gICAgbGV0IGV4YWN0TWF0Y2ggPSBmYWxzZTtcbiAgICBpZiAocGF0dGVybi5zdGFydHNXaXRoKCcvJykgJiYgcGF0dGVybi5lbmRzV2l0aCgnLycpKSB7XG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi5zdWJzdHIoMSwgcGF0dGVybi5sZW5ndGggLSAyKTtcbiAgICAgIGlmIChwYXR0ZXJuLnN0YXJ0c1dpdGgoJ14nKSAmJiBwYXR0ZXJuLmVuZHNXaXRoKCckJykpIHtcbiAgICAgICAgcGF0dGVybiA9IHBhdHRlcm4uc3Vic3RyKDEsIHBhdHRlcm4ubGVuZ3RoIC0gMik7XG4gICAgICAgIGV4YWN0TWF0Y2ggPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICB0cnkge1xuICAgICAgLy8gU2VhcmNoIGZvciB0aGUgcGF0dGVybiBpbiB0aGUgZmlsZS5cbiAgICAgIGNvbnN0IHNlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdGaWxlU3lzdGVtU2VydmljZScsIHRhZy5maWxlKTtcbiAgICAgIGludmFyaWFudChzZXJ2aWNlKTtcbiAgICAgIGNvbnN0IGNvbnRlbnRzID0gYXdhaXQgc2VydmljZS5yZWFkRmlsZShnZXRQYXRoKHRhZy5maWxlKSk7XG4gICAgICBjb25zdCBsaW5lcyA9IGNvbnRlbnRzLnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJ1xcbicpO1xuICAgICAgbGluZU51bWJlciA9IDA7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChleGFjdE1hdGNoID8gbGluZXNbaV0gPT09IHBhdHRlcm4gOiBsaW5lc1tpXS5pbmRleE9mKHBhdHRlcm4pICE9PSAtMSkge1xuICAgICAgICAgIGxpbmVOdW1iZXIgPSBpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZ2V0TG9nZ2VyKCkud2FybihgbnVjbGlkZS1yZW1vdGUtY3RhZ3M6IENvdWxkIG5vdCBsb2NhdGUgcGF0dGVybiBpbiAke3RhZy5maWxlfWAsIGUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBsaW5lTnVtYmVyO1xufVxuIl19