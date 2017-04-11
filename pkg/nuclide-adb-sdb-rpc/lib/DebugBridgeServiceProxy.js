"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getDeviceList = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "db",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 53
        },
        kind: "named",
        name: "DebugBridgeType"
      }
    }]).then(args => {
      return _client.callRemoteFunction("DebugBridgeService/getDeviceList", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 53
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 53
          },
          kind: "named",
          name: "DeviceDescription"
        }
      });
    });
  };

  remoteModule.installPackage = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "db",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 58
        },
        kind: "named",
        name: "DebugBridgeType"
      }
    }, {
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 59
        },
        kind: "string"
      }
    }, {
      name: "packagePath",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 60
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("DebugBridgeService/installPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 61
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.uninstallPackage = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "db",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 68
        },
        kind: "named",
        name: "DebugBridgeType"
      }
    }, {
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 69
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 70
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("DebugBridgeService/uninstallPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 71
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.getPidFromPackageName = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "db",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 78
        },
        kind: "named",
        name: "DebugBridgeType"
      }
    }, {
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 79
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 80
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("DebugBridgeService/getPidFromPackageName", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 81
        },
        kind: "number"
      });
    });
  };

  remoteModule.forwardJdwpPortToPid = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "db",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 86
        },
        kind: "named",
        name: "DebugBridgeType"
      }
    }, {
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 87
        },
        kind: "string"
      }
    }, {
      name: "tcpPort",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 88
        },
        kind: "number"
      }
    }, {
      name: "pid",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 89
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("DebugBridgeService/forwardJdwpPortToPid", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 90
        },
        kind: "string"
      });
    });
  };

  remoteModule.launchActivity = function (arg0, arg1, arg2, arg3, arg4, arg5) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "db",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 96
        },
        kind: "named",
        name: "DebugBridgeType"
      }
    }, {
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 97
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 98
        },
        kind: "string"
      }
    }, {
      name: "activity",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 99
        },
        kind: "string"
      }
    }, {
      name: "debug",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 100
        },
        kind: "boolean"
      }
    }, {
      name: "action",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 101
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 101
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("DebugBridgeService/launchActivity", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 102
        },
        kind: "string"
      });
    });
  };

  remoteModule.activityExists = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "db",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 108
        },
        kind: "named",
        name: "DebugBridgeType"
      }
    }, {
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 109
        },
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 110
        },
        kind: "string"
      }
    }, {
      name: "activity",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 111
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("DebugBridgeService/activityExists", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 112
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.getJavaProcesses = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "db",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 118
        },
        kind: "named",
        name: "DebugBridgeType"
      }
    }, {
      name: "device",
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 119
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("DebugBridgeService/getJavaProcesses", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 120
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 120
          },
          kind: "named",
          name: "AndroidJavaProcess"
        }
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
    DebugBridgeType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "DebugBridgeService.js",
        line: 20
      },
      name: "DebugBridgeType",
      definition: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 20
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 20
          },
          kind: "string-literal",
          value: "adb"
        }, {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 20
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
        fileName: "DebugBridgeService.js",
        line: 22
      },
      name: "DeviceDescription",
      definition: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 22
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 23
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 23
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 24
          },
          name: "architecture",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 24
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 25
          },
          name: "apiVersion",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 25
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 26
          },
          name: "model",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 26
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
        fileName: "DebugBridgeService.js",
        line: 29
      },
      name: "AndroidJavaProcess",
      definition: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 29
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 30
          },
          name: "user",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 30
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 31
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 31
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 32
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 32
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    getDeviceList: {
      kind: "function",
      name: "getDeviceList",
      location: {
        type: "source",
        fileName: "DebugBridgeService.js",
        line: 53
      },
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 53
        },
        kind: "function",
        argumentTypes: [{
          name: "db",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 53
            },
            kind: "named",
            name: "DebugBridgeType"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 53
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 53
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "DebugBridgeService.js",
                line: 53
              },
              kind: "named",
              name: "DeviceDescription"
            }
          }
        }
      }
    },
    installPackage: {
      kind: "function",
      name: "installPackage",
      location: {
        type: "source",
        fileName: "DebugBridgeService.js",
        line: 57
      },
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 57
        },
        kind: "function",
        argumentTypes: [{
          name: "db",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 58
            },
            kind: "named",
            name: "DebugBridgeType"
          }
        }, {
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 59
            },
            kind: "string"
          }
        }, {
          name: "packagePath",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 60
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 61
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 61
            },
            kind: "named",
            name: "ProcessMessage"
          }
        }
      }
    },
    uninstallPackage: {
      kind: "function",
      name: "uninstallPackage",
      location: {
        type: "source",
        fileName: "DebugBridgeService.js",
        line: 67
      },
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 67
        },
        kind: "function",
        argumentTypes: [{
          name: "db",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 68
            },
            kind: "named",
            name: "DebugBridgeType"
          }
        }, {
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 69
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 70
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 71
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 71
            },
            kind: "named",
            name: "ProcessMessage"
          }
        }
      }
    },
    getPidFromPackageName: {
      kind: "function",
      name: "getPidFromPackageName",
      location: {
        type: "source",
        fileName: "DebugBridgeService.js",
        line: 77
      },
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 77
        },
        kind: "function",
        argumentTypes: [{
          name: "db",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 78
            },
            kind: "named",
            name: "DebugBridgeType"
          }
        }, {
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 79
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 80
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 81
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 81
            },
            kind: "number"
          }
        }
      }
    },
    forwardJdwpPortToPid: {
      kind: "function",
      name: "forwardJdwpPortToPid",
      location: {
        type: "source",
        fileName: "DebugBridgeService.js",
        line: 85
      },
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 85
        },
        kind: "function",
        argumentTypes: [{
          name: "db",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 86
            },
            kind: "named",
            name: "DebugBridgeType"
          }
        }, {
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 87
            },
            kind: "string"
          }
        }, {
          name: "tcpPort",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 88
            },
            kind: "number"
          }
        }, {
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 89
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 90
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 90
            },
            kind: "string"
          }
        }
      }
    },
    launchActivity: {
      kind: "function",
      name: "launchActivity",
      location: {
        type: "source",
        fileName: "DebugBridgeService.js",
        line: 95
      },
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 95
        },
        kind: "function",
        argumentTypes: [{
          name: "db",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 96
            },
            kind: "named",
            name: "DebugBridgeType"
          }
        }, {
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 97
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 98
            },
            kind: "string"
          }
        }, {
          name: "activity",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 99
            },
            kind: "string"
          }
        }, {
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 100
            },
            kind: "boolean"
          }
        }, {
          name: "action",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 101
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "DebugBridgeService.js",
                line: 101
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 102
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 102
            },
            kind: "string"
          }
        }
      }
    },
    activityExists: {
      kind: "function",
      name: "activityExists",
      location: {
        type: "source",
        fileName: "DebugBridgeService.js",
        line: 107
      },
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 107
        },
        kind: "function",
        argumentTypes: [{
          name: "db",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 108
            },
            kind: "named",
            name: "DebugBridgeType"
          }
        }, {
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 109
            },
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 110
            },
            kind: "string"
          }
        }, {
          name: "activity",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 111
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 112
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 112
            },
            kind: "boolean"
          }
        }
      }
    },
    getJavaProcesses: {
      kind: "function",
      name: "getJavaProcesses",
      location: {
        type: "source",
        fileName: "DebugBridgeService.js",
        line: 117
      },
      type: {
        location: {
          type: "source",
          fileName: "DebugBridgeService.js",
          line: 117
        },
        kind: "function",
        argumentTypes: [{
          name: "db",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 118
            },
            kind: "named",
            name: "DebugBridgeType"
          }
        }, {
          name: "device",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 119
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "DebugBridgeService.js",
            line: 120
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "DebugBridgeService.js",
              line: 120
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "DebugBridgeService.js",
                line: 120
              },
              kind: "named",
              name: "AndroidJavaProcess"
            }
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
          line: 20
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 20
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 21
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 21
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 22
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 23
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 24
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 25
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 25
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
            line: 26
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 28
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
        line: 31
      },
      name: "ProcessInfo",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 31
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 32
          },
          name: "parentPid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 32
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 33
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 33
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 34
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 34
            },
            kind: "string"
          },
          optional: false
        }]
      }
    }
  }
});