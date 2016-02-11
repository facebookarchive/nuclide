Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commons = require('../../commons');

var _pathSetLogic = require('./pathSetLogic');

var _rx = require('rx');

var MAX_RESULTS_COUNT = 25;

function findIn(query, corpus) {
  var results = [];
  for (var str of corpus) {
    if (str.indexOf(query) !== -1) {
      results.push(str);
    }
  }
  return results;
}

var SPLIT_CHARS = /[\/\s]/;
var ONLY_NON_ALPHANUMERIC_CHARS = /^[\W]*$/;
function splitFilePath(path) {
  var split = path.split(SPLIT_CHARS).filter(function (p) {
    return !p.match(ONLY_NON_ALPHANUMERIC_CHARS);
  });
  return {
    last: split.pop(),
    paths: split
  };
}

function splitQuery(query) {
  return query.split(SPLIT_CHARS).filter(function (segment) {
    return !segment.match(ONLY_NON_ALPHANUMERIC_CHARS);
  });
}

function approximateMatchIndicesFor(query, path, matchedSegments) {
  var matchedIndices = new Set();
  // Add indices of matched segments
  for (var segment of matchedSegments) {
    var startIndex = path.toLowerCase().indexOf(segment);
    for (var index = startIndex; index < startIndex + segment.length; index++) {
      matchedIndices.add(index);
    }
  }
  return _commons.array.from(matchedIndices);
}

var LazyPathSet = (function () {
  function LazyPathSet() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, LazyPathSet);

    var rawPaths = options.paths || {};
    var paths = new Set();
    for (var path in rawPaths) {
      paths.add(path);
    }
    this._paths = paths;
    this._buildIndex();
  }

  // For testing purposes only.

  _createClass(LazyPathSet, [{
    key: '_getPaths',
    value: function _getPaths() {
      return this._paths;
    }

    // For testing purposes only.
  }, {
    key: '_getIndex',
    value: function _getIndex() {
      return this._index;
    }
  }, {
    key: '_buildIndex',
    value: function _buildIndex() {
      var segments = new Map();
      var filenames = new Map();
      for (var path of this._paths) {
        var lowercasePath = path.toLowerCase();

        var _splitFilePath = splitFilePath(lowercasePath);

        var _paths = _splitFilePath.paths;
        var _last = _splitFilePath.last;

        for (var segment of _paths) {
          var pathsContainingSegment = segments.get(segment) || new Set();
          pathsContainingSegment.add(path);
          segments.set(segment, pathsContainingSegment);
        }
        var pathsEndingWithFilename = filenames.get(_last) || new Set();
        pathsEndingWithFilename.add(path);
        filenames.set(_last, pathsEndingWithFilename);
      }

      this._index = {
        segments: segments,
        filenames: filenames
      };
    }
  }, {
    key: 'doQuery',
    value: function doQuery(query) {
      var _this = this;

      var results = new Map();

      var querySegmentsToMatch = new Set(splitQuery(query.toLowerCase()));
      var matchedQuerySegments = new Map();

      // Try to match segments directly.
      for (var segment of querySegmentsToMatch) {
        var candidate = this._index.segments.get(segment);
        if (candidate != null) {
          // It is safe to delete the current element while iterating using Iterators.
          querySegmentsToMatch['delete'](segment);
          matchedQuerySegments.set(segment, [candidate]);
        }
      }

      // Try to match remaining segments fuzzily.
      for (var segment of querySegmentsToMatch) {
        var matches = findIn(segment, this._index.segments.keys());
        if (matches.length > 0) {
          querySegmentsToMatch['delete'](segment);
          // TODO consider the remaining matchedSegments
          matchedQuerySegments.set(segment, matches.map(function (match) {
            return _this._index.segments.get(match) || new Set();
          }));
        }
      }

      if (matchedQuerySegments.size > 0) {
        //TODO fix this `if`
        var pathSets = [];
        for (var matchedSegments of matchedQuerySegments.values()) {
          // TODO consider the remaining matchedSegments
          pathSets.push(matchedSegments[0]);
        }
        // Smaller candidate sets are likely more entropic, so consider them first.
        pathSets.sort(function (s1, s2) {
          return s1.size - s2.size;
        });
        var setsToIntersect = (0, _pathSetLogic.enumerateAllCombinations)(pathSets);

        var unmatchedREs = [];
        for (var unmatchedSegment of querySegmentsToMatch) {
          unmatchedREs.push(new RegExp(unmatchedSegment.split('').join('.*?'), 'i'));
        }

        for (var combination of setsToIntersect) {
          var intersectionOfMatchedSegments = (0, _pathSetLogic.intersectMany)(combination);

          var _loop = function (potentialMatch) {

            if (!results.has(potentialMatch) && (unmatchedREs.length === 0 || unmatchedREs.every(function (re) {
              return re.test(potentialMatch);
            }))) {
              results.set(potentialMatch, {
                value: potentialMatch,
                score: 0,
                matchIndexes: approximateMatchIndicesFor(query, potentialMatch, _commons.array.from(matchedQuerySegments.keys()).filter(function (segment) {
                  return potentialMatch.toLowerCase().indexOf(segment) !== -1;
                }))
              });
            }
            if (results.size >= MAX_RESULTS_COUNT) {
              return 'break';
            }
          };

          for (var potentialMatch of intersectionOfMatchedSegments) {
            var _ret = _loop(potentialMatch);

            if (_ret === 'break') break;
          }
          if (results.size >= MAX_RESULTS_COUNT) {
            break;
          }
        }
      }

      return _rx.Observable.from(results.values()); // TODO stream results as they appear.
    }
  }]);

  return LazyPathSet;
})();

exports['default'] = LazyPathSet;
var __test__ = {
  approximateMatchIndicesFor: approximateMatchIndicesFor
};
exports.__test__ = __test__;
// assumed to be lowercase path segments.
//# sourceMappingURL=data:application/json;base64,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Yzs7a0NBcUJyQixNQUFNO1dBRVQ7QUFDRCxjQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksaUJBQWlCLEVBQUU7QUFDckMsa0JBQU07V0FDUDtTQUNGO09BQ0Y7O0FBRUQsYUFBTyxlQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztLQUMxQzs7O1NBN0hrQixXQUFXOzs7cUJBQVgsV0FBVztBQWlJekIsSUFBTSxRQUFRLEdBQUc7QUFDdEIsNEJBQTBCLEVBQTFCLDBCQUEwQjtDQUMzQixDQUFDIiwiZmlsZSI6IkxhenlQYXRoU2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgdHlwZSB7UXVlcnlTY29yZX0gZnJvbSAnLi9RdWVyeVNjb3JlJztcbmltcG9ydCB7ZW51bWVyYXRlQWxsQ29tYmluYXRpb25zLCBpbnRlcnNlY3RNYW55fSBmcm9tICcuL3BhdGhTZXRMb2dpYyc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4JztcbnR5cGUgUGF0aCA9IHN0cmluZztcbnR5cGUgUGF0aFNlZ21lbnQgPSBzdHJpbmc7XG50eXBlIFBhdGhTZXQgPSBTZXQ8UGF0aD47XG50eXBlIFBhdGhTZXRJbmRleCA9IHtcbiAgc2VnbWVudHM6IE1hcDxQYXRoU2VnbWVudCwgUGF0aFNldD4sXG4gIGZpbGVuYW1lczogTWFwPFBhdGhTZWdtZW50LCBQYXRoU2V0Pixcbn07XG5cbmNvbnN0IE1BWF9SRVNVTFRTX0NPVU5UID0gMjU7XG5cbmZ1bmN0aW9uIGZpbmRJbihxdWVyeTogc3RyaW5nLCBjb3JwdXM6IEl0ZXJhdG9yPHN0cmluZz4pOiBBcnJheTxzdHJpbmc+IHtcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICBmb3IgKGNvbnN0IHN0ciBvZiBjb3JwdXMpIHtcbiAgICBpZiAoc3RyLmluZGV4T2YocXVlcnkpICE9PSAtMSkge1xuICAgICAgcmVzdWx0cy5wdXNoKHN0cik7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5jb25zdCBTUExJVF9DSEFSUyA9IC9bXFwvXFxzXS87XG5jb25zdCBPTkxZX05PTl9BTFBIQU5VTUVSSUNfQ0hBUlMgPSAvXltcXFddKiQvO1xuZnVuY3Rpb24gc3BsaXRGaWxlUGF0aChwYXRoOiBzdHJpbmcpOiB7bGFzdDogUGF0aFNlZ21lbnQ7IHBhdGhzOiBBcnJheTxQYXRoU2VnbWVudD47fSB7XG4gIGNvbnN0IHNwbGl0ID0gcGF0aC5zcGxpdChTUExJVF9DSEFSUykuZmlsdGVyKHAgPT4gIXAubWF0Y2goT05MWV9OT05fQUxQSEFOVU1FUklDX0NIQVJTKSk7XG4gIHJldHVybiB7XG4gICAgbGFzdDogc3BsaXQucG9wKCksXG4gICAgcGF0aHM6IHNwbGl0LFxuICB9O1xufVxuXG5mdW5jdGlvbiBzcGxpdFF1ZXJ5KHF1ZXJ5OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+IHtcbiAgcmV0dXJuIHF1ZXJ5LnNwbGl0KFNQTElUX0NIQVJTKS5maWx0ZXIoc2VnbWVudCA9PiAhc2VnbWVudC5tYXRjaChPTkxZX05PTl9BTFBIQU5VTUVSSUNfQ0hBUlMpKTtcbn1cblxuZnVuY3Rpb24gYXBwcm94aW1hdGVNYXRjaEluZGljZXNGb3IoXG4gIHF1ZXJ5OiBzdHJpbmcsXG4gIHBhdGg6IHN0cmluZyxcbiAgbWF0Y2hlZFNlZ21lbnRzOiBBcnJheTxzdHJpbmc+LCAvLyBhc3N1bWVkIHRvIGJlIGxvd2VyY2FzZSBwYXRoIHNlZ21lbnRzLlxuKTogQXJyYXk8bnVtYmVyPiB7XG4gIGNvbnN0IG1hdGNoZWRJbmRpY2VzID0gbmV3IFNldCgpO1xuICAvLyBBZGQgaW5kaWNlcyBvZiBtYXRjaGVkIHNlZ21lbnRzXG4gIGZvciAoY29uc3Qgc2VnbWVudCBvZiBtYXRjaGVkU2VnbWVudHMpIHtcbiAgICBjb25zdCBzdGFydEluZGV4ID0gcGF0aC50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VnbWVudCk7XG4gICAgZm9yIChsZXQgaW5kZXggPSBzdGFydEluZGV4OyBpbmRleCA8IHN0YXJ0SW5kZXggKyBzZWdtZW50Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgbWF0Y2hlZEluZGljZXMuYWRkKGluZGV4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycmF5LmZyb20obWF0Y2hlZEluZGljZXMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYXp5UGF0aFNldCB7XG4gIF9wYXRoczogUGF0aFNldDtcbiAgX2luZGV4OiBQYXRoU2V0SW5kZXg7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczoge3BhdGhzPzoge1trZXk6IHN0cmluZ106IGJvb2xlYW59fSA9IHt9KSB7XG4gICAgY29uc3QgcmF3UGF0aHMgPSBvcHRpb25zLnBhdGhzIHx8IHt9O1xuICAgIGNvbnN0IHBhdGhzID0gbmV3IFNldCgpO1xuICAgIGZvciAoY29uc3QgcGF0aCBpbiByYXdQYXRocykge1xuICAgICAgcGF0aHMuYWRkKHBhdGgpO1xuICAgIH1cbiAgICB0aGlzLl9wYXRocyA9IHBhdGhzO1xuICAgIHRoaXMuX2J1aWxkSW5kZXgoKTtcbiAgfVxuXG4gIC8vIEZvciB0ZXN0aW5nIHB1cnBvc2VzIG9ubHkuXG4gIF9nZXRQYXRocygpOiBQYXRoU2V0IHtcbiAgICByZXR1cm4gdGhpcy5fcGF0aHM7XG4gIH1cblxuICAvLyBGb3IgdGVzdGluZyBwdXJwb3NlcyBvbmx5LlxuICBfZ2V0SW5kZXgoKTogUGF0aFNldEluZGV4IHtcbiAgICByZXR1cm4gdGhpcy5faW5kZXg7XG4gIH1cblxuICBfYnVpbGRJbmRleCgpOiB2b2lkIHtcbiAgICBjb25zdCBzZWdtZW50cyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBmaWxlbmFtZXMgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBwYXRoIG9mIHRoaXMuX3BhdGhzKSB7XG4gICAgICBjb25zdCBsb3dlcmNhc2VQYXRoID0gcGF0aC50b0xvd2VyQ2FzZSgpO1xuICAgICAgY29uc3Qge3BhdGhzLCBsYXN0fSA9IHNwbGl0RmlsZVBhdGgobG93ZXJjYXNlUGF0aCk7XG4gICAgICBmb3IgKGNvbnN0IHNlZ21lbnQgb2YgcGF0aHMpIHtcbiAgICAgICAgY29uc3QgcGF0aHNDb250YWluaW5nU2VnbWVudCA9IHNlZ21lbnRzLmdldChzZWdtZW50KSB8fCBuZXcgU2V0KCk7XG4gICAgICAgIHBhdGhzQ29udGFpbmluZ1NlZ21lbnQuYWRkKHBhdGgpO1xuICAgICAgICBzZWdtZW50cy5zZXQoc2VnbWVudCwgcGF0aHNDb250YWluaW5nU2VnbWVudCk7XG4gICAgICB9XG4gICAgICBjb25zdCBwYXRoc0VuZGluZ1dpdGhGaWxlbmFtZSA9IGZpbGVuYW1lcy5nZXQobGFzdCkgfHwgbmV3IFNldCgpO1xuICAgICAgcGF0aHNFbmRpbmdXaXRoRmlsZW5hbWUuYWRkKHBhdGgpO1xuICAgICAgZmlsZW5hbWVzLnNldChsYXN0LCBwYXRoc0VuZGluZ1dpdGhGaWxlbmFtZSk7XG4gICAgfVxuXG4gICAgdGhpcy5faW5kZXggPSB7XG4gICAgICBzZWdtZW50cyxcbiAgICAgIGZpbGVuYW1lcyxcbiAgICB9O1xuICB9XG5cbiAgZG9RdWVyeShxdWVyeTogc3RyaW5nKTogT2JzZXJ2YWJsZTxRdWVyeVNjb3JlPiB7XG4gICAgY29uc3QgcmVzdWx0czogTWFwPFBhdGgsIFF1ZXJ5U2NvcmU+ID0gbmV3IE1hcCgpO1xuXG4gICAgY29uc3QgcXVlcnlTZWdtZW50c1RvTWF0Y2g6IFNldDxQYXRoU2VnbWVudD4gPSBuZXcgU2V0KHNwbGl0UXVlcnkocXVlcnkudG9Mb3dlckNhc2UoKSkpO1xuICAgIGNvbnN0IG1hdGNoZWRRdWVyeVNlZ21lbnRzOiBNYXA8UGF0aFNlZ21lbnQsIEFycmF5PFNldDxQYXRoPj4+ID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gVHJ5IHRvIG1hdGNoIHNlZ21lbnRzIGRpcmVjdGx5LlxuICAgIGZvciAoY29uc3Qgc2VnbWVudCBvZiBxdWVyeVNlZ21lbnRzVG9NYXRjaCkge1xuICAgICAgY29uc3QgY2FuZGlkYXRlID0gdGhpcy5faW5kZXguc2VnbWVudHMuZ2V0KHNlZ21lbnQpO1xuICAgICAgaWYgKGNhbmRpZGF0ZSAhPSBudWxsKSB7XG4gICAgICAgIC8vIEl0IGlzIHNhZmUgdG8gZGVsZXRlIHRoZSBjdXJyZW50IGVsZW1lbnQgd2hpbGUgaXRlcmF0aW5nIHVzaW5nIEl0ZXJhdG9ycy5cbiAgICAgICAgcXVlcnlTZWdtZW50c1RvTWF0Y2guZGVsZXRlKHNlZ21lbnQpO1xuICAgICAgICBtYXRjaGVkUXVlcnlTZWdtZW50cy5zZXQoc2VnbWVudCwgW2NhbmRpZGF0ZV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRyeSB0byBtYXRjaCByZW1haW5pbmcgc2VnbWVudHMgZnV6emlseS5cbiAgICBmb3IgKGNvbnN0IHNlZ21lbnQgb2YgcXVlcnlTZWdtZW50c1RvTWF0Y2gpIHtcbiAgICAgIGNvbnN0IG1hdGNoZXMgPSBmaW5kSW4oc2VnbWVudCwgdGhpcy5faW5kZXguc2VnbWVudHMua2V5cygpKTtcbiAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcXVlcnlTZWdtZW50c1RvTWF0Y2guZGVsZXRlKHNlZ21lbnQpO1xuICAgICAgICAvLyBUT0RPIGNvbnNpZGVyIHRoZSByZW1haW5pbmcgbWF0Y2hlZFNlZ21lbnRzXG4gICAgICAgIG1hdGNoZWRRdWVyeVNlZ21lbnRzLnNldChcbiAgICAgICAgICBzZWdtZW50LFxuICAgICAgICAgIG1hdGNoZXMubWFwKFxuICAgICAgICAgICAgbWF0Y2ggPT4gdGhpcy5faW5kZXguc2VnbWVudHMuZ2V0KG1hdGNoKSB8fCBuZXcgU2V0KClcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1hdGNoZWRRdWVyeVNlZ21lbnRzLnNpemUgPiAwKSB7Ly9UT0RPIGZpeCB0aGlzIGBpZmBcbiAgICAgIGNvbnN0IHBhdGhTZXRzOiBBcnJheTxTZXQ8UGF0aD4+ID0gW107XG4gICAgICBmb3IgKGNvbnN0IG1hdGNoZWRTZWdtZW50cyBvZiBtYXRjaGVkUXVlcnlTZWdtZW50cy52YWx1ZXMoKSkge1xuICAgICAgICAvLyBUT0RPIGNvbnNpZGVyIHRoZSByZW1haW5pbmcgbWF0Y2hlZFNlZ21lbnRzXG4gICAgICAgIHBhdGhTZXRzLnB1c2gobWF0Y2hlZFNlZ21lbnRzWzBdKTtcbiAgICAgIH1cbiAgICAgIC8vIFNtYWxsZXIgY2FuZGlkYXRlIHNldHMgYXJlIGxpa2VseSBtb3JlIGVudHJvcGljLCBzbyBjb25zaWRlciB0aGVtIGZpcnN0LlxuICAgICAgcGF0aFNldHMuc29ydCgoczEsIHMyKSA9PiBzMS5zaXplIC0gczIuc2l6ZSk7XG4gICAgICBjb25zdCBzZXRzVG9JbnRlcnNlY3QgPSBlbnVtZXJhdGVBbGxDb21iaW5hdGlvbnMocGF0aFNldHMpO1xuXG4gICAgICBjb25zdCB1bm1hdGNoZWRSRXMgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgdW5tYXRjaGVkU2VnbWVudCBvZiBxdWVyeVNlZ21lbnRzVG9NYXRjaCkge1xuICAgICAgICB1bm1hdGNoZWRSRXMucHVzaChuZXcgUmVnRXhwKHVubWF0Y2hlZFNlZ21lbnQuc3BsaXQoJycpLmpvaW4oJy4qPycpLCAnaScpKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBjb21iaW5hdGlvbiBvZiBzZXRzVG9JbnRlcnNlY3QpIHtcbiAgICAgICAgY29uc3QgaW50ZXJzZWN0aW9uT2ZNYXRjaGVkU2VnbWVudHMgPSBpbnRlcnNlY3RNYW55KGNvbWJpbmF0aW9uKTtcbiAgICAgICAgZm9yIChjb25zdCBwb3RlbnRpYWxNYXRjaCBvZiBpbnRlcnNlY3Rpb25PZk1hdGNoZWRTZWdtZW50cykge1xuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIXJlc3VsdHMuaGFzKHBvdGVudGlhbE1hdGNoKSAmJlxuICAgICAgICAgICAgKHVubWF0Y2hlZFJFcy5sZW5ndGggPT09IDAgfHwgdW5tYXRjaGVkUkVzLmV2ZXJ5KHJlID0+IHJlLnRlc3QocG90ZW50aWFsTWF0Y2gpKSlcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJlc3VsdHMuc2V0KFxuICAgICAgICAgICAgICBwb3RlbnRpYWxNYXRjaCxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBwb3RlbnRpYWxNYXRjaCxcbiAgICAgICAgICAgICAgICBzY29yZTogMCxcbiAgICAgICAgICAgICAgICBtYXRjaEluZGV4ZXM6IGFwcHJveGltYXRlTWF0Y2hJbmRpY2VzRm9yKFxuICAgICAgICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICAgICAgICBwb3RlbnRpYWxNYXRjaCxcbiAgICAgICAgICAgICAgICAgIGFycmF5LmZyb20obWF0Y2hlZFF1ZXJ5U2VnbWVudHMua2V5cygpKVxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKHNlZ21lbnQgPT4gcG90ZW50aWFsTWF0Y2gudG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlZ21lbnQpICE9PSAtMSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocmVzdWx0cy5zaXplID49IE1BWF9SRVNVTFRTX0NPVU5UKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc3VsdHMuc2l6ZSA+PSBNQVhfUkVTVUxUU19DT1VOVCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIE9ic2VydmFibGUuZnJvbShyZXN1bHRzLnZhbHVlcygpKTsvLyBUT0RPIHN0cmVhbSByZXN1bHRzIGFzIHRoZXkgYXBwZWFyLlxuICB9XG5cbn1cblxuZXhwb3J0IGNvbnN0IF9fdGVzdF9fID0ge1xuICBhcHByb3hpbWF0ZU1hdGNoSW5kaWNlc0Zvcixcbn07XG4iXX0=