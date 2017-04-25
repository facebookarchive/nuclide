"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.registerSdbPath = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "id",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 20
        },
        kind: "string"
      }
    }, {
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 21
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "priority",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 22
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 22
          },
          kind: "number"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/registerSdbPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 23
        },
        kind: "void"
      });
    });
  };

  remoteModule.getDeviceInfo = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "name",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 31
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/getDeviceInfo", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 31
        },
        kind: "map",
        keyType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 31
          },
          kind: "string"
        },
        valueType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 31
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.startServer = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("SdbService/startServer", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 35
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.getDeviceList = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("SdbService/getDeviceList", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 39
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 39
          },
          kind: "named",
          name: "DeviceDescription"
        }
      });
    });
  };

  remoteModule.getPidFromPackageName = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 44
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 45
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/getPidFromPackageName", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 46
        },
        kind: "number"
      });
    });
  };

  remoteModule.getFileContentsAtPath = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 51
        },
        kind: "string"
      }
    }, {
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 52
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/getFileContentsAtPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 53
        },
        kind: "string"
      });
    });
  };

  remoteModule.installPackage = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 58
        },
        kind: "string"
      }
    }, {
      name: "packagePath",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 59
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/installPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 60
        },
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.launchApp = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 67
        },
        kind: "string"
      }
    }, {
      name: "identifier",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 68
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/launchApp", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 69
        },
        kind: "string"
      });
    });
  };

  remoteModule.uninstallPackage = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 74
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 75
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/uninstallPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 76
        },
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
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
    registerSdbPath: {
      kind: "function",
      name: "registerSdbPath",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 19
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 19
        },
        kind: "function",
        argumentTypes: [{
          name: "id",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 20
            },
            kind: "string"
          }
        }, {
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 21
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "priority",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 22
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "SdbService.js",
                line: 22
              },
              kind: "number"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 23
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 23
            },
            kind: "void"
          }
        }
      }
    },
    getDeviceInfo: {
      kind: "function",
      name: "getDeviceInfo",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 31
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 31
        },
        kind: "function",
        argumentTypes: [{
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 31
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 31
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 31
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "SdbService.js",
                line: 31
              },
              kind: "string"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "SdbService.js",
                line: 31
              },
              kind: "string"
            }
          }
        }
      }
    },
    startServer: {
      kind: "function",
      name: "startServer",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 35
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 35
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 35
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 35
            },
            kind: "boolean"
          }
        }
      }
    },
    getDeviceList: {
      kind: "function",
      name: "getDeviceList",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 39
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 39
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 39
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 39
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "SdbService.js",
                line: 39
              },
              kind: "named",
              name: "DeviceDescription"
            }
          }
        }
      }
    },
    getPidFromPackageName: {
      kind: "function",
      name: "getPidFromPackageName",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 43
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 43
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 44
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 45
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 46
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 46
            },
            kind: "number"
          }
        }
      }
    },
    getFileContentsAtPath: {
      kind: "function",
      name: "getFileContentsAtPath",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 50
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 50
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 51
            },
            kind: "string"
          }
        }, {
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 52
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 53
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 53
            },
            kind: "string"
          }
        }
      }
    },
    installPackage: {
      kind: "function",
      name: "installPackage",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 57
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 57
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 58
            },
            kind: "string"
          }
        }, {
          name: "packagePath",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 59
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 60
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 60
            },
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    launchApp: {
      kind: "function",
      name: "launchApp",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 66
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 66
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 67
            },
            kind: "string"
          }
        }, {
          name: "identifier",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 68
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 69
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 69
            },
            kind: "string"
          }
        }
      }
    },
    uninstallPackage: {
      kind: "function",
      name: "uninstallPackage",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 73
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 73
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 74
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 75
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SdbService.js",
            line: 76
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "SdbService.js",
              line: 76
            },
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 13
      },
      name: "ProcessExitMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 13
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "signal",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 20
      },
      name: "ProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 21
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 21
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 22
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 25
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 26
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 26
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 13
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 14
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 15
                },
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 16
                },
                kind: "string"
              }
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    LegacyProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 33
      },
      name: "LegacyProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 33
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 21
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 22
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 25
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 26
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 26
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 13
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 14
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 15
                },
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 16
                },
                kind: "string"
              }
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 33
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 33
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 33
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 33
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 33
              },
              kind: "named",
              name: "Object"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    ProcessInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 35
      },
      name: "ProcessInfo",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 35
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 36
          },
          name: "parentPid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 36
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 37
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 37
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 38
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 38
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    AndroidJavaProcess: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 11
      },
      name: "AndroidJavaProcess",
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
          name: "user",
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
          name: "pid",
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
            line: 14
          },
          name: "name",
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
    DebugBridgeType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 18
      },
      name: "DebugBridgeType",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 18
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 18
          },
          kind: "string-literal",
          value: "adb"
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 18
          },
          kind: "string-literal",
          value: "sdb"
        }]
      }
    },
    DeviceDescription: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 20
      },
      name: "DeviceDescription",
      definition: {
        location: {
          type: "source",
          fileName: "types.js",
          line: 20
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "types.js",
            line: 21
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 21
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
          name: "architecture",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 22
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 23
          },
          name: "apiVersion",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 23
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "types.js",
            line: 24
          },
          name: "model",
          type: {
            location: {
              type: "source",
              fileName: "types.js",
              line: 24
            },
            kind: "string"
          },
          optional: false
        }]
      }
    }
  }
});