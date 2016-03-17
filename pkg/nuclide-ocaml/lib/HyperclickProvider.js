function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _constants = require('./constants');

var EXTENSIONS = new Set(['ml', 'mli']);

module.exports = {
  priority: 20,
  providerName: 'nuclide-ocaml',
  getSuggestionForWord: _asyncToGenerator(function* (textEditor, text, range) {
    var _require = require('../../nuclide-client');

    var getServiceByNuclideUri = _require.getServiceByNuclideUri;

    if (!_constants.GRAMMARS.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    var file = textEditor.getPath();

    if (file == null) {
      return null;
    }

    var kind = 'ml';
    var extension = _path2['default'].extname(file);
    if (EXTENSIONS.has(extension)) {
      kind = extension;
    }

    var instance = yield getServiceByNuclideUri('MerlinService', file);
    (0, _assert2['default'])(instance);
    var start = range.start;

    return {
      range: range,
      callback: _asyncToGenerator(function* () {
        yield instance.pushNewBuffer(file, textEditor.getText());
        var location = yield instance.locate(file, start.row, start.column, kind);
        if (!location) {
          return;
        }

        var _require2 = require('../../nuclide-atom-helpers');

        var goToLocation = _require2.goToLocation;

        goToLocation(location.file, location.pos.line - 1, location.pos.col);
      })
    };
  })
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBYWlCLE1BQU07Ozs7c0JBQ0QsUUFBUTs7Ozt5QkFDUCxhQUFhOztBQUVwQyxJQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUN6QixJQUFJLEVBQ0osS0FBSyxDQUNOLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsVUFBUSxFQUFFLEVBQUU7QUFDWixjQUFZLEVBQUUsZUFBZTtBQUM3QixBQUFNLHNCQUFvQixvQkFBQSxXQUN4QixVQUEyQixFQUMzQixJQUFZLEVBQ1osS0FBaUIsRUFDZTttQkFDQyxPQUFPLENBQUMsc0JBQXNCLENBQUM7O1FBQXpELHNCQUFzQixZQUF0QixzQkFBc0I7O0FBRTdCLFFBQUksQ0FBQyxvQkFBUyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ3BELGFBQU8sSUFBSSxDQUFDO0tBQ2I7O0FBRUQsUUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVsQyxRQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEIsYUFBTyxJQUFJLENBQUM7S0FDYjs7QUFFRCxRQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDaEIsUUFBTSxTQUFTLEdBQUcsa0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JDLFFBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUM3QixVQUFJLEdBQUcsU0FBUyxDQUFDO0tBQ2xCOztBQUVELFFBQU0sUUFBUSxHQUFHLE1BQU0sc0JBQXNCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JFLDZCQUFVLFFBQVEsQ0FBQyxDQUFDO0FBQ3BCLFFBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRTFCLFdBQU87QUFDTCxXQUFLLEVBQUwsS0FBSztBQUNMLGNBQVEsb0JBQUUsYUFBaUI7QUFDekIsY0FBTSxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUN6RCxZQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQ3BDLElBQUksRUFDSixLQUFLLENBQUMsR0FBRyxFQUNULEtBQUssQ0FBQyxNQUFNLEVBQ1osSUFBSSxDQUFDLENBQUM7QUFDUixZQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsaUJBQU87U0FDUjs7d0JBRXNCLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQzs7WUFBckQsWUFBWSxhQUFaLFlBQVk7O0FBQ25CLG9CQUFZLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUN0RSxDQUFBO0tBQ0YsQ0FBQztHQUNILENBQUE7Q0FDRixDQUFDIiwiZmlsZSI6Ikh5cGVyY2xpY2tQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIeXBlcmNsaWNrU3VnZ2VzdGlvbn0gZnJvbSAnLi4vLi4vaHlwZXJjbGljay1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0dSQU1NQVJTfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmNvbnN0IEVYVEVOU0lPTlMgPSBuZXcgU2V0KFtcbiAgJ21sJyxcbiAgJ21saScsXG5dKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHByaW9yaXR5OiAyMCxcbiAgcHJvdmlkZXJOYW1lOiAnbnVjbGlkZS1vY2FtbCcsXG4gIGFzeW5jIGdldFN1Z2dlc3Rpb25Gb3JXb3JkKFxuICAgIHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgcmFuZ2U6IGF0b20kUmFuZ2VcbiAgKTogUHJvbWlzZTw/SHlwZXJjbGlja1N1Z2dlc3Rpb24+IHtcbiAgICBjb25zdCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNsaWVudCcpO1xuXG4gICAgaWYgKCFHUkFNTUFSUy5oYXModGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZSA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuXG4gICAgaWYgKGZpbGUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IGtpbmQgPSAnbWwnO1xuICAgIGNvbnN0IGV4dGVuc2lvbiA9IHBhdGguZXh0bmFtZShmaWxlKTtcbiAgICBpZiAoRVhURU5TSU9OUy5oYXMoZXh0ZW5zaW9uKSkge1xuICAgICAga2luZCA9IGV4dGVuc2lvbjtcbiAgICB9XG5cbiAgICBjb25zdCBpbnN0YW5jZSA9IGF3YWl0IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ01lcmxpblNlcnZpY2UnLCBmaWxlKTtcbiAgICBpbnZhcmlhbnQoaW5zdGFuY2UpO1xuICAgIGNvbnN0IHN0YXJ0ID0gcmFuZ2Uuc3RhcnQ7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmFuZ2UsXG4gICAgICBjYWxsYmFjazogYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGF3YWl0IGluc3RhbmNlLnB1c2hOZXdCdWZmZXIoZmlsZSwgdGV4dEVkaXRvci5nZXRUZXh0KCkpO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGF3YWl0IGluc3RhbmNlLmxvY2F0ZShcbiAgICAgICAgICBmaWxlLFxuICAgICAgICAgIHN0YXJ0LnJvdyxcbiAgICAgICAgICBzdGFydC5jb2x1bW4sXG4gICAgICAgICAga2luZCk7XG4gICAgICAgIGlmICghbG9jYXRpb24pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7Z29Ub0xvY2F0aW9ufSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJyk7XG4gICAgICAgIGdvVG9Mb2NhdGlvbihsb2NhdGlvbi5maWxlLCBsb2NhdGlvbi5wb3MubGluZSAtIDEsIGxvY2F0aW9uLnBvcy5jb2wpO1xuICAgICAgfSxcbiAgICB9O1xuICB9LFxufTtcbiJdfQ==