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
            line: 27
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
            line: 47
          },
          kind: "string"
        });
      }).publish();
    }

    getAtomNotificationObservable() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 27
          },
          name: "IwdpDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getAtomNotificationObservable", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 51
          },
          kind: "named",
          name: "AtomNotification"
        });
      }).publish();
    }

    attach(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "targetEnvironment",
        type: {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 55
          },
          kind: "named",
          name: "TargetEnvironment"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 27
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
            line: 55
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
            line: 78
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 27
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
            line: 78
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
    IwdpDebuggerService: {
      kind: "interface",
      name: "IwdpDebuggerService",
      location: {
        type: "source",
        fileName: "IwdpDebuggerService.js",
        line: 27
      },
      constructorArgs: [],
      staticMethods: {},
      instanceMethods: {
        getServerMessageObservable: {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 47
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "IwdpDebuggerService.js",
              line: 47
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "IwdpDebuggerService.js",
                line: 47
              },
              kind: "string"
            }
          }
        },
        getAtomNotificationObservable: {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 51
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "IwdpDebuggerService.js",
              line: 51
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "IwdpDebuggerService.js",
                line: 51
              },
              kind: "named",
              name: "AtomNotification"
            }
          }
        },
        attach: {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 55
          },
          kind: "function",
          argumentTypes: [{
            name: "targetEnvironment",
            type: {
              location: {
                type: "source",
                fileName: "IwdpDebuggerService.js",
                line: 55
              },
              kind: "named",
              name: "TargetEnvironment"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "IwdpDebuggerService.js",
              line: 55
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "IwdpDebuggerService.js",
                line: 55
              },
              kind: "string"
            }
          }
        },
        sendCommand: {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 78
          },
          kind: "function",
          argumentTypes: [{
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "IwdpDebuggerService.js",
                line: 78
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "IwdpDebuggerService.js",
              line: 78
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "IwdpDebuggerService.js",
                line: 78
              },
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "IwdpDebuggerService.js",
            line: 83
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "IwdpDebuggerService.js",
              line: 83
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "IwdpDebuggerService.js",
                line: 83
              },
              kind: "void"
            }
          }
        }
      }
    },
    DeviceInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 11
      },
      name: "DeviceInfo",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 11
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 12
          },
          name: "webSocketDebuggerUrl",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 12
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 13
          },
          name: "title",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 13
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    IosDeviceInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 16
      },
      name: "IosDeviceInfo",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 16
        },
        kind: "intersection",
        types: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 16
          },
          kind: "named",
          name: "DeviceInfo"
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 16
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "types.js",
              line: 17
            },
            name: "devtoolsFrontendUrl",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 17
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 18
            },
            name: "faviconUrl",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 18
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 19
            },
            name: "thumbnailUrl",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 19
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 20
            },
            name: "url",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 20
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 21
            },
            name: "appId",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 21
              },
              kind: "string"
            },
            optional: false
          }]
        }],
        flattened: {
          kind: "object",
          location: {
            type: "source",
            fileName: "types.js",
            line: 16
          },
          fields: [{
            location: {
              type: "source",
              fileName: "types.js",
              line: 12
            },
            name: "webSocketDebuggerUrl",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 12
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 13
            },
            name: "title",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 13
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 17
            },
            name: "devtoolsFrontendUrl",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 17
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 18
            },
            name: "faviconUrl",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 18
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 19
            },
            name: "thumbnailUrl",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 19
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 20
            },
            name: "url",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 20
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 21
            },
            name: "appId",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 21
              },
              kind: "string"
            },
            optional: false
          }]
        }
      }
    },
    PackagerDeviceInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 24
      },
      name: "PackagerDeviceInfo",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 24
        },
        kind: "intersection",
        types: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 24
          },
          kind: "named",
          name: "DeviceInfo"
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 24
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "types.js",
              line: 25
            },
            name: "id",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 25
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 26
            },
            name: "description",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 26
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 27
            },
            name: "devtoolsFrontendUrl",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 27
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 28
            },
            name: "deviceId",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 28
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 29
            },
            name: "deviceName",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 29
              },
              kind: "string"
            },
            optional: false
          }]
        }],
        flattened: {
          kind: "object",
          location: {
            type: "source",
            fileName: "types.js",
            line: 24
          },
          fields: [{
            location: {
              type: "source",
              fileName: "types.js",
              line: 12
            },
            name: "webSocketDebuggerUrl",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 12
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 13
            },
            name: "title",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 13
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 25
            },
            name: "id",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 25
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 26
            },
            name: "description",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 26
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 27
            },
            name: "devtoolsFrontendUrl",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 27
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 28
            },
            name: "deviceId",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 28
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "types.js",
              line: 29
            },
            name: "deviceName",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 29
              },
              kind: "string"
            },
            optional: false
          }]
        }
      }
    },
    RuntimeStatus: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 32
      },
      name: "RuntimeStatus",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 32
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 32
          },
          kind: "string-literal",
          value: "RUNNING"
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 32
          },
          kind: "string-literal",
          value: "PAUSED"
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 32
          },
          kind: "string-literal",
          value: "ENDED"
        }]
      }
    },
    BreakpointId: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 33
      },
      name: "BreakpointId",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 33
        },
        kind: "string"
      }
    },
    BreakpointParams: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 34
      },
      name: "BreakpointParams",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 34
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 35
          },
          name: "lineNumber",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 35
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 36
          },
          name: "url",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 36
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 37
          },
          name: "columnNumber",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 37
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 38
          },
          name: "condition",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 38
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    Breakpoint: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 40
      },
      name: "Breakpoint",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 40
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 41
          },
          name: "nuclideId",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 41
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 42
          },
          name: "jscId",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 42
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "types.js",
                line: 42
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 43
          },
          name: "resolved",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 43
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 44
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 44
            },
            kind: "named",
            name: "BreakpointParams"
          },
          optional: false
        }]
      }
    },
    PauseOnExceptionState: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 46
      },
      name: "PauseOnExceptionState",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 46
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 46
          },
          kind: "string-literal",
          value: "none"
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 46
          },
          kind: "string-literal",
          value: "uncaught"
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 46
          },
          kind: "string-literal",
          value: "all"
        }]
      }
    },
    TargetEnvironment: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 48
      },
      name: "TargetEnvironment",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 48
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 48
          },
          kind: "string-literal",
          value: "iOS"
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 48
          },
          kind: "string-literal",
          value: "Android"
        }]
      }
    },
    AtomNotificationType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 11
      },
      name: "AtomNotificationType",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 11
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 11
          },
          kind: "string-literal",
          value: "info"
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 11
          },
          kind: "string-literal",
          value: "warning"
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 11
          },
          kind: "string-literal",
          value: "error"
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 11
          },
          kind: "string-literal",
          value: "fatalError"
        }]
      }
    },
    AtomNotification: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 12
      },
      name: "AtomNotification",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 12
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 13
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 13
            },
            kind: "named",
            name: "AtomNotificationType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 14
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 14
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    ThreadColumn: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 18
      },
      name: "ThreadColumn",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 18
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 19
          },
          name: "title",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 19
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 20
          },
          name: "key",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 20
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 22
          },
          name: "width",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 22
            },
            kind: "number"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 25
          },
          name: "component",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 25
            },
            kind: "any"
          },
          optional: true
        }]
      }
    }
  }
});