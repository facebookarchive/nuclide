"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileIOWrapper = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _MessagePackager = require("./MessagePackager.js");

var _invariant = require("../invariant.js");

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileIOWrapper = exports.FileIOWrapper = function () {
  function FileIOWrapper(isAdapter, inFilePath, outFilePath) {
    _classCallCheck(this, FileIOWrapper);

    this._inFilePath = inFilePath;
    this._outFilePath = outFilePath;
    if (!_fs2.default.existsSync(this._inFilePath)) _fs2.default.openSync(this._inFilePath, "w");
    if (!_fs2.default.existsSync(this._outFilePath)) _fs2.default.openSync(this._outFilePath, "w");
    this._packager = new _MessagePackager.MessagePackager(isAdapter);
    this._isAdapter = isAdapter;
  }

  _createClass(FileIOWrapper, [{
    key: "readIn",


    // Read in a message from the input asynchronously
    value: function readIn(errorHandler, messageProcessor) {
      var _this = this;

      _fs2.default.readFile(this._inFilePath, { encoding: "utf8" }, function (err, contents) {
        if (err) {
          errorHandler(err);
          return;
        }
        var message = _this._packager.unpackage(contents);
        if (message === null) {
          _this.readIn(errorHandler, messageProcessor);
          return;
        }
        //clear the file
        _fs2.default.writeFileSync(_this._inFilePath, "");
        //process the message
        messageProcessor(message);
      });
    }

    // Read in a message from the input synchronously

  }, {
    key: "readInSync",
    value: function readInSync() {
      var message = null;
      while (true) {
        var contents = _fs2.default.readFileSync(this._inFilePath, "utf8");
        message = this._packager.unpackage(contents);
        if (message === null) continue;
        break;
      }
      // loop should not break when message is still null
      (0, _invariant2.default)(message !== null);
      //clear the file
      _fs2.default.writeFileSync(this._inFilePath, "");
      return message;
    }

    // Read in a message from the input synchronously only once

  }, {
    key: "readInSyncOnce",
    value: function readInSyncOnce() {
      var contents = _fs2.default.readFileSync(this._inFilePath, "utf8");
      var message = this._packager.unpackage(contents);
      return message;
    }

    // Write out a message to the output synchronously

  }, {
    key: "writeOutSync",
    value: function writeOutSync(contents) {
      _fs2.default.writeFileSync(this._outFilePath, this._packager.package(contents));
    }
  }, {
    key: "clearInFile",
    value: function clearInFile() {
      _fs2.default.writeFileSync(this._inFilePath, "");
    }
  }, {
    key: "clearOutFile",
    value: function clearOutFile() {
      _fs2.default.writeFileSync(this._outFilePath, "");
    }
  }]);

  return FileIOWrapper;
}();
//# sourceMappingURL=FileIOWrapper.js.map