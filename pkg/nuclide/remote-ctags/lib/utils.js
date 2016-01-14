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
        var contents = yield (0, _remoteConnection.getServiceByNuclideUri)('FileSystemService', tag.file).readFile((0, _remoteUri.getPath)(tag.file));
        var lines = contents.toString('utf8').split('\n');
        lineNumber = 0;
        for (var i = 0; i < lines.length; i++) {
          if (exactMatch ? lines[i] === pattern : lines[i].indexOf(pattern) !== -1) {
            lineNumber = i;
            break;
          }
        }
      } catch (e) {
        (0, _logging.getLogger)().warn('nuclide-remote-ctags: Could not locate pattern in ' + tag.file, e);
      }
    }

  return lineNumber;
});

exports.getLineNumberForTag = getLineNumberForTag;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _logging = require('../../logging');

var _remoteConnection = require('../../remote-connection');

var _remoteUri = require('../../remote-uri');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQWlDc0IsbUJBQW1CLHFCQUFsQyxXQUFtQyxHQUFnQixFQUFtQjtNQUN0RSxVQUFVLEdBQWEsR0FBRyxDQUExQixVQUFVO01BQUUsT0FBTyxHQUFJLEdBQUcsQ0FBZCxPQUFPOztBQUN4QixNQUFJLFVBQVUsRUFBRTtBQUNkLGNBQVUsRUFBRSxDQUFDO0dBQ2QsTUFBTSxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7OztBQUcxQixVQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFDdkIsVUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDcEQsZUFBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEQsWUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDcEQsaUJBQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hELG9CQUFVLEdBQUcsSUFBSSxDQUFDO1NBQ25CO09BQ0Y7QUFDRCxVQUFJOztBQUVGLFlBQU0sUUFBUSxHQUFHLE1BQU0sOENBQXVCLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FDekUsUUFBUSxDQUFDLHdCQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFlBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BELGtCQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckMsY0FBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ3hFLHNCQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ2Ysa0JBQU07V0FDUDtTQUNGO09BQ0YsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGlDQUFXLENBQUMsSUFBSSx3REFBc0QsR0FBRyxDQUFDLElBQUksRUFBSSxDQUFDLENBQUMsQ0FBQztPQUN0RjtLQUNGOztBQUVELFNBQU8sVUFBVSxDQUFDO0NBQ25COzs7Ozs7dUJBckR1QixlQUFlOztnQ0FDRix5QkFBeUI7O3lCQUN4QyxrQkFBa0I7OztBQUdqQyxJQUFNLGdCQUFnQixHQUFHO0FBQzlCLEdBQUMsRUFBRSxPQUFPO0FBQ1YsR0FBQyxFQUFFLFFBQVE7QUFDWCxHQUFDLEVBQUUsTUFBTTtBQUNULEdBQUMsRUFBRSxVQUFVO0FBQ2IsR0FBQyxFQUFFLE1BQU07QUFDVCxHQUFDLEVBQUUsTUFBTTtBQUNULEdBQUMsRUFBRSxRQUFRO0FBQ1gsR0FBQyxFQUFFLFVBQVU7QUFDYixHQUFDLEVBQUUsUUFBUTtBQUNYLEdBQUMsRUFBRSxTQUFTO0FBQ1osR0FBQyxFQUFFLE9BQU87QUFDVixHQUFDLEVBQUUsS0FBSztDQUNULENBQUMiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Q3RhZ3NSZXN1bHR9IGZyb20gJy4uLy4uL3JlbW90ZS1jdGFncy1iYXNlJztcblxuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5pbXBvcnQge2dldFBhdGh9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG4vLyBUYWtlbiBmcm9tIGh0dHA6Ly9jdGFncy5zb3VyY2Vmb3JnZS5uZXQvRk9STUFUXG5leHBvcnQgY29uc3QgQ1RBR1NfS0lORF9OQU1FUyA9IHtcbiAgYzogJ2NsYXNzJyxcbiAgZDogJ2RlZmluZScsXG4gIGU6ICdlbnVtJyxcbiAgZjogJ2Z1bmN0aW9uJyxcbiAgRjogJ2ZpbGUnLFxuICBnOiAnZW51bScsXG4gIG06ICdtZW1iZXInLFxuICBwOiAnZnVuY3Rpb24nLFxuICBzOiAnc3RydWN0JyxcbiAgdDogJ3R5cGVkZWYnLFxuICB1OiAndW5pb24nLFxuICB2OiAndmFyJyxcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRMaW5lTnVtYmVyRm9yVGFnKHRhZzogQ3RhZ3NSZXN1bHQpOiBQcm9taXNlPG51bWJlcj4ge1xuICBsZXQge2xpbmVOdW1iZXIsIHBhdHRlcm59ID0gdGFnO1xuICBpZiAobGluZU51bWJlcikge1xuICAgIGxpbmVOdW1iZXItLTsgLy8gY3RhZ3MgbGluZSBudW1iZXJzIHN0YXJ0IGF0IDFcbiAgfSBlbHNlIGlmIChwYXR0ZXJuICE9IG51bGwpIHtcbiAgICAvLyBjdGFncyBkb2VzIG5vdCBlc2NhcGUgcmVnZXhwcyBwcm9wZXJseS5cbiAgICAvLyBIb3dldmVyLCBpdCBzaG91bGQgbmV2ZXIgY3JlYXRlIGFueXRoaW5nIGJleW9uZCAveC8gb3IgL154JC8uXG4gICAgbGV0IGV4YWN0TWF0Y2ggPSBmYWxzZTtcbiAgICBpZiAocGF0dGVybi5zdGFydHNXaXRoKCcvJykgJiYgcGF0dGVybi5lbmRzV2l0aCgnLycpKSB7XG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi5zdWJzdHIoMSwgcGF0dGVybi5sZW5ndGggLSAyKTtcbiAgICAgIGlmIChwYXR0ZXJuLnN0YXJ0c1dpdGgoJ14nKSAmJiBwYXR0ZXJuLmVuZHNXaXRoKCckJykpIHtcbiAgICAgICAgcGF0dGVybiA9IHBhdHRlcm4uc3Vic3RyKDEsIHBhdHRlcm4ubGVuZ3RoIC0gMik7XG4gICAgICAgIGV4YWN0TWF0Y2ggPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICB0cnkge1xuICAgICAgLy8gU2VhcmNoIGZvciB0aGUgcGF0dGVybiBpbiB0aGUgZmlsZS5cbiAgICAgIGNvbnN0IGNvbnRlbnRzID0gYXdhaXQgZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnRmlsZVN5c3RlbVNlcnZpY2UnLCB0YWcuZmlsZSlcbiAgICAgICAgLnJlYWRGaWxlKGdldFBhdGgodGFnLmZpbGUpKTtcbiAgICAgIGNvbnN0IGxpbmVzID0gY29udGVudHMudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnXFxuJyk7XG4gICAgICBsaW5lTnVtYmVyID0gMDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGV4YWN0TWF0Y2ggPyBsaW5lc1tpXSA9PT0gcGF0dGVybiA6IGxpbmVzW2ldLmluZGV4T2YocGF0dGVybikgIT09IC0xKSB7XG4gICAgICAgICAgbGluZU51bWJlciA9IGk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBnZXRMb2dnZXIoKS53YXJuKGBudWNsaWRlLXJlbW90ZS1jdGFnczogQ291bGQgbm90IGxvY2F0ZSBwYXR0ZXJuIGluICR7dGFnLmZpbGV9YCwgZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGxpbmVOdW1iZXI7XG59XG4iXX0=