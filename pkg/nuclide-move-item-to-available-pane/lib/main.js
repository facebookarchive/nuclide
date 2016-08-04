Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _move2;

function _move() {
  return _move2 = require('./move');
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
  }

  _createClass(Activation, [{
    key: 'activate',
    value: function activate() {
      this._disposables.add(atom.commands.add('atom-text-editor', {
        // Pass the eta expansion of these functions to defer the loading of move.js.
        'nuclide-move-item-to-available-pane:right': function nuclideMoveItemToAvailablePaneRight() {
          return (0, (_move2 || _move()).moveRight)();
        },
        'nuclide-move-item-to-available-pane:left': function nuclideMoveItemToAvailablePaneLeft() {
          return (0, (_move2 || _move()).moveLeft)();
        },
        'nuclide-move-item-to-available-pane:up': function nuclideMoveItemToAvailablePaneUp() {
          return (0, (_move2 || _move()).moveUp)();
        },
        'nuclide-move-item-to-available-pane:down': function nuclideMoveItemToAvailablePaneDown() {
          return (0, (_move2 || _move()).moveDown)();
        }
      }));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
    activation.activate();
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}