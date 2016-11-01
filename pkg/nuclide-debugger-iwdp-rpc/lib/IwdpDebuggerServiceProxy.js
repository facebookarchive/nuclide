"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.IwdpDebuggerService = class {
    constructor() {
      _client.createRemoteObject("IwdpDebuggerService", this, [], []);
    }

    getServerMessageObservable() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 24
          },
          name: "IwdpDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getServerMessageObservable", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 44
          },
          kind: "string"
        });
      }).publish();
    }

    attach() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 24
          },
          name: "IwdpDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "attach", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 48
          },
          kind: "string"
        });
      });
    }

    sendCommand(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 58
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 24
          },
          name: "IwdpDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "sendCommand", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 58
          },
          kind: "void"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["IwdpDebuggerService", {
    kind: "interface",
    name: "IwdpDebuggerService",
    location: {
      type: "source",
      fileName: "IwdpDebuggerService.js",
      line: 24
    },
    constructorArgs: [],
    staticMethods: new Map(),
    instanceMethods: new Map([["getServerMessageObservable", {
      location: {
        type: "source",
        fileName: "IwdpDebuggerService.js",
        line: 44
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "IwdpDebuggerService.js",
          line: 44
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 44
          },
          kind: "string"
        }
      }
    }], ["attach", {
      location: {
        type: "source",
        fileName: "IwdpDebuggerService.js",
        line: 48
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "IwdpDebuggerService.js",
          line: 48
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 48
          },
          kind: "string"
        }
      }
    }], ["sendCommand", {
      location: {
        type: "source",
        fileName: "IwdpDebuggerService.js",
        line: 58
      },
      kind: "function",
      argumentTypes: [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 58
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "IwdpDebuggerService.js",
          line: 58
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 58
          },
          kind: "void"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "IwdpDebuggerService.js",
        line: 63
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "IwdpDebuggerService.js",
          line: 63
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 63
          },
          kind: "void"
        }
      }
    }]])
  }]])
});