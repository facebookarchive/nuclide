var formatCode = _asyncToGenerator(function* (options, editor) {
  editor = editor || atom.workspace.getActiveTextEditor();
  if (!editor) {
    logger.info('- format-js: No active text editor');
    return;
  }

  (0, _nuclideAnalytics.track)('format-js-formatCode');

  // Save things
  var buffer = editor.getBuffer();
  var oldSource = buffer.getText();
  var source = oldSource;

  // Reprint transform.
  if (_nuclideFeatureConfig2.default.get('nuclide-format-js.reprint')) {
    var _require = require('../../nuclide-reprint-js');

    var reprint = _require.reprint;

    // $FlowFixMe(kad) -- this seems to conflate an class instance with an ordinary object.
    var reprintResult = reprint(source, {
      maxLineLength: 80,
      useSpaces: true,
      tabWidth: 2
    });
    source = reprintResult.source;
  }

  // Auto-require transform.
  // TODO: Add a limit so the transform is not run on files over a certain size.

  var _require2 = require('../../nuclide-format-js-base');

  var transform = _require2.transform;

  source = transform(source, options);

  // Update the source and position after all transforms are done. Do nothing
  // if the source did not change at all.
  if (source === oldSource) {
    return;
  }

  var range = buffer.getRange();
  var position = editor.getCursorBufferPosition();
  editor.setTextInBufferRange(range, source);

  var _updateCursor = (0, _nuclideUpdateCursor.updateCursor)(oldSource, position, source);

  var row = _updateCursor.row;
  var column = _updateCursor.column;

  editor.setCursorBufferPosition([row, column]);

  // Save the file if that option is specified.
  if (_nuclideFeatureConfig2.default.get('nuclide-format-js.saveAfterRun')) {
    editor.save();
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideUpdateCursor = require('../../nuclide-update-cursor');

var logger = require('../../nuclide-logging').getLogger();

module.exports = formatCode;