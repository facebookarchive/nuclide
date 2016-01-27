function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var GRAMMARS = new Set(['source.ocaml']);
var EXTENSIONS = new Set(['ml', 'mli']);

module.exports = {
  priority: 20,
  providerName: 'nuclide-ocaml',
  getSuggestionForWord: _asyncToGenerator(function* (textEditor, text, range) {
    var _require = require('../../client');

    var getServiceByNuclideUri = _require.getServiceByNuclideUri;

    if (!GRAMMARS.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    var file = textEditor.getPath();

    if (file == null) {
      return null;
    }

    var kind = 'ml';
    var extension = require('path').extname(file);
    if (EXTENSIONS.has(extension)) {
      kind = extension;
    }

    var instance = yield getServiceByNuclideUri('MerlinService', file);
    var start = range.start;

    return {
      range: range,
      callback: _asyncToGenerator(function* () {
        yield instance.pushNewBuffer(file, textEditor.getText());
        var location = yield instance.locate(file, start.row, start.column, kind);
        if (!location) {
          return;
        }

        var _require2 = require('../../atom-helpers');

        var goToLocation = _require2.goToLocation;

        goToLocation(location.file, location.pos.line - 1, location.pos.col);
      })
    };
  })
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBYUEsSUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FDdkIsY0FBYyxDQUNmLENBQUMsQ0FBQztBQUNILElBQU0sVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLENBQ3pCLElBQUksRUFDSixLQUFLLENBQ04sQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUUsRUFBRTtBQUNaLGNBQVksRUFBRSxlQUFlO0FBQzdCLEFBQU0sc0JBQW9CLG9CQUFBLFdBQ3hCLFVBQTJCLEVBQzNCLElBQVksRUFDWixLQUFpQixFQUNlO21CQUNDLE9BQU8sQ0FBQyxjQUFjLENBQUM7O1FBQWpELHNCQUFzQixZQUF0QixzQkFBc0I7O0FBRTdCLFFBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUNwRCxhQUFPLElBQUksQ0FBQztLQUNiOztBQUVELFFBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFbEMsUUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2hCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7O0FBRUQsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEQsUUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQzdCLFVBQUksR0FBRyxTQUFTLENBQUM7S0FDbEI7O0FBRUQsUUFBTSxRQUFRLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckUsUUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQzs7QUFFMUIsV0FBTztBQUNMLFdBQUssRUFBTCxLQUFLO0FBQ0wsY0FBUSxvQkFBRSxhQUFpQjtBQUN6QixjQUFNLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3pELFlBQU0sUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FDcEMsSUFBSSxFQUNKLEtBQUssQ0FBQyxHQUFHLEVBQ1QsS0FBSyxDQUFDLE1BQU0sRUFDWixJQUFJLENBQUMsQ0FBQztBQUNSLFlBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixpQkFBTztTQUNSOzt3QkFFc0IsT0FBTyxDQUFDLG9CQUFvQixDQUFDOztZQUE3QyxZQUFZLGFBQVosWUFBWTs7QUFDbkIsb0JBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3RFLENBQUE7S0FDRixDQUFDO0dBQ0gsQ0FBQTtDQUNGLENBQUMiLCJmaWxlIjoiSHlwZXJjbGlja1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tTdWdnZXN0aW9ufSBmcm9tICcuLi8uLi9oeXBlcmNsaWNrLWludGVyZmFjZXMnO1xuXG5jb25zdCBHUkFNTUFSUyA9IG5ldyBTZXQoW1xuICAnc291cmNlLm9jYW1sJyxcbl0pO1xuY29uc3QgRVhURU5TSU9OUyA9IG5ldyBTZXQoW1xuICAnbWwnLFxuICAnbWxpJyxcbl0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcHJpb3JpdHk6IDIwLFxuICBwcm92aWRlck5hbWU6ICdudWNsaWRlLW9jYW1sJyxcbiAgYXN5bmMgZ2V0U3VnZ2VzdGlvbkZvcldvcmQoXG4gICAgdGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICAgIHRleHQ6IHN0cmluZyxcbiAgICByYW5nZTogYXRvbSRSYW5nZVxuICApOiBQcm9taXNlPD9IeXBlcmNsaWNrU3VnZ2VzdGlvbj4ge1xuICAgIGNvbnN0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSA9IHJlcXVpcmUoJy4uLy4uL2NsaWVudCcpO1xuXG4gICAgaWYgKCFHUkFNTUFSUy5oYXModGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZSA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuXG4gICAgaWYgKGZpbGUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IGtpbmQgPSAnbWwnO1xuICAgIGNvbnN0IGV4dGVuc2lvbiA9IHJlcXVpcmUoJ3BhdGgnKS5leHRuYW1lKGZpbGUpO1xuICAgIGlmIChFWFRFTlNJT05TLmhhcyhleHRlbnNpb24pKSB7XG4gICAgICBraW5kID0gZXh0ZW5zaW9uO1xuICAgIH1cblxuICAgIGNvbnN0IGluc3RhbmNlID0gYXdhaXQgZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnTWVybGluU2VydmljZScsIGZpbGUpO1xuICAgIGNvbnN0IHN0YXJ0ID0gcmFuZ2Uuc3RhcnQ7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmFuZ2UsXG4gICAgICBjYWxsYmFjazogYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGF3YWl0IGluc3RhbmNlLnB1c2hOZXdCdWZmZXIoZmlsZSwgdGV4dEVkaXRvci5nZXRUZXh0KCkpO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGF3YWl0IGluc3RhbmNlLmxvY2F0ZShcbiAgICAgICAgICBmaWxlLFxuICAgICAgICAgIHN0YXJ0LnJvdyxcbiAgICAgICAgICBzdGFydC5jb2x1bW4sXG4gICAgICAgICAga2luZCk7XG4gICAgICAgIGlmICghbG9jYXRpb24pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7Z29Ub0xvY2F0aW9ufSA9IHJlcXVpcmUoJy4uLy4uL2F0b20taGVscGVycycpO1xuICAgICAgICBnb1RvTG9jYXRpb24obG9jYXRpb24uZmlsZSwgbG9jYXRpb24ucG9zLmxpbmUgLSAxLCBsb2NhdGlvbi5wb3MuY29sKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn07XG4iXX0=