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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _commonsAtomProjects2;

function _commonsAtomProjects() {
  return _commonsAtomProjects2 = require('../../commons-atom/projects');
}

var _shell2;

function _shell() {
  return _shell2 = _interopRequireDefault(require('shell'));
}

var _util2;

function _util() {
  return _util2 = require('./util');
}

var VcsLog = (function (_React$Component) {
  _inherits(VcsLog, _React$Component);

  function VcsLog(props) {
    _classCallCheck(this, VcsLog);

    _get(Object.getPrototypeOf(VcsLog.prototype), 'constructor', this).call(this, props);
    this._files = [];
    for (var file of props.files) {
      var projectPath = (0, (_commonsAtomProjects2 || _commonsAtomProjects()).getAtomProjectRelativePath)(file);
      if (projectPath != null) {
        this._files.push(projectPath);
      }
    }

    this.state = {
      logEntries: null
    };
  }

  _createClass(VcsLog, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var logEntries = this.state.logEntries;

      if (logEntries != null) {
        var _ret = (function () {
          // Even if the "Show Differential Revision" preference is enabled, only show the column if
          // there is at least one row with a Differential revision. This way, enabling the preference
          // by default should still work fine for non-Differential users.

          var showDifferentialRevision = undefined;
          var differentialUrls = [];
          if (_this.props.showDifferentialRevision) {
            logEntries.forEach(function (logEntry, index) {
              var url = parseDifferentialRevision(logEntry);
              if (url != null) {
                differentialUrls[index] = url;
              }
            });
            showDifferentialRevision = differentialUrls.length > 0;
          } else {
            showDifferentialRevision = false;
          }

          var rows = logEntries.map(function (logEntry, index) {
            var differentialCell = undefined;
            if (showDifferentialRevision) {
              (function () {
                var url = differentialUrls[index];
                var revision = undefined;
                var onClick = undefined;
                if (url != null) {
                  revision = url.substring(url.lastIndexOf('/') + 1);
                  onClick = function () {
                    return (_shell2 || _shell()).default.openExternal(url);
                  };
                } else {
                  revision = null;
                  onClick = null;
                }
                differentialCell = (_reactForAtom2 || _reactForAtom()).React.createElement(
                  'td',
                  { className: 'nuclide-vcs-log-differential-cell' },
                  (_reactForAtom2 || _reactForAtom()).React.createElement(
                    'span',
                    { className: 'nuclide-vcs-log-differential-cell-text', onClick: onClick },
                    revision
                  )
                );
              })();
            } else {
              differentialCell = null;
            }

            return (_reactForAtom2 || _reactForAtom()).React.createElement(
              'tr',
              { key: logEntry.node },
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'td',
                { className: 'nuclide-vcs-log-date-cell' },
                _this._toDateString(logEntry.date[0])
              ),
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'td',
                { className: 'nuclide-vcs-log-id-cell' },
                logEntry.node.substring(0, 8)
              ),
              differentialCell,
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'td',
                { className: 'nuclide-vcs-log-author-cell' },
                (0, (_util2 || _util()).shortNameForAuthor)(logEntry.user)
              ),
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'td',
                { className: 'nuclide-vcs-log-summary-cell', title: logEntry.desc },
                parseFirstLine(logEntry.desc)
              )
            );
          });

          // Note that we use the native-key-bindings/tabIndex=-1 trick to make it possible to
          // copy/paste text from the pane. This has to be applied on a child element of
          // nuclide-vcs-log-scroll-container, or else the native-key-bindings/tabIndex=-1 will
          // interfere with scrolling.
          return {
            v: (_reactForAtom2 || _reactForAtom()).React.createElement(
              'div',
              { className: 'nuclide-vcs-log-scroll-container' },
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'div',
                { className: 'native-key-bindings', tabIndex: '-1' },
                (_reactForAtom2 || _reactForAtom()).React.createElement(
                  'table',
                  null,
                  (_reactForAtom2 || _reactForAtom()).React.createElement(
                    'tbody',
                    null,
                    (_reactForAtom2 || _reactForAtom()).React.createElement(
                      'tr',
                      null,
                      (_reactForAtom2 || _reactForAtom()).React.createElement(
                        'th',
                        { className: 'nuclide-vcs-log-header-cell' },
                        'Date'
                      ),
                      (_reactForAtom2 || _reactForAtom()).React.createElement(
                        'th',
                        { className: 'nuclide-vcs-log-header-cell' },
                        'ID'
                      ),
                      showDifferentialRevision ? (_reactForAtom2 || _reactForAtom()).React.createElement(
                        'th',
                        { className: 'nuclide-vcs-log-header-cell' },
                        'Revision'
                      ) : null,
                      (_reactForAtom2 || _reactForAtom()).React.createElement(
                        'th',
                        { className: 'nuclide-vcs-log-header-cell' },
                        'Author'
                      ),
                      (_reactForAtom2 || _reactForAtom()).React.createElement(
                        'th',
                        { className: 'nuclide-vcs-log-header-cell' },
                        'Summary'
                      )
                    ),
                    rows
                  )
                )
              )
            )
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      } else {
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'em',
              null,
              'Loading hg log ',
              this._files.join(' ')
            )
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-vcs-log-spinner' },
            (_reactForAtom2 || _reactForAtom()).React.createElement('div', { className: 'loading-spinner-large inline-block' })
          )
        );
      }
    }
  }, {
    key: '_toDateString',
    value: function _toDateString(secondsSince1970) {
      var date = new Date(secondsSince1970 * 1000);

      // We may want to make date formatting customizable via props.
      // The format of str is "Fri Apr 22 2016 21:32:51 GMT+0100 (BST)".
      // Note that this is date will be displayed in the local time zone of the viewer rather
      // than that of the author of the commit.
      var str = date.toString();

      // Strip the day of week from the start of the string and the seconds+TZ from the end.
      var startIndex = str.indexOf(' ') + 1;
      var endIndex = str.lastIndexOf(':');
      return str.substring(startIndex, endIndex);
    }
  }]);

  return VcsLog;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = VcsLog;

function parseFirstLine(desc) {
  var index = desc.indexOf('\n');
  if (index === -1) {
    return desc;
  } else {
    return desc.substring(0, index);
  }
}

var DIFFERENTIAL_REVISION_RE = /^Differential Revision:\s*(.*)$/im;

function parseDifferentialRevision(logEntry) {
  var desc = logEntry.desc;

  var match = desc.match(DIFFERENTIAL_REVISION_RE);
  if (match != null) {
    return match[1];
  } else {
    return null;
  }
}
module.exports = exports.default;