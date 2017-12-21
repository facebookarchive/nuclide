"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getServerVersion = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("InfoService/getServerVersion", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.closeConnection = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "shutdownServer",
      type: {
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("InfoService/closeConnection", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    getServerVersion: {
      kind: "function",
      name: "getServerVersion",
      location: {
        type: "source",
        fileName: "InfoService.js",
        line: 18
      },
      type: {
        location: {
          type: "source",
          fileName: "InfoService.js",
          line: 18
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
          }
        }
      }
    },
    closeConnection: {
      kind: "function",
      name: "closeConnection",
      location: {
        type: "source",
        fileName: "InfoService.js",
        line: 25
      },
      type: {
        location: {
          type: "source",
          fileName: "InfoService.js",
          line: 25
        },
        kind: "function",
        argumentTypes: [{
          name: "shutdownServer",
          type: {
            kind: "boolean"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    }
  }
});