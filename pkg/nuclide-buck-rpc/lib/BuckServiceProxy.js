"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getRootForPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 148
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getRootForPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 148
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 148
          },
          kind: "named",
          name: "NuclideUri"
        }
      });
    });
  };

  remoteModule.getBuildFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 155
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "targetName",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 155
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getBuildFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 155
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 155
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.getOwner = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 215
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 215
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getOwner", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 215
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 215
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.getBuckConfig = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 234
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "section",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 235
        },
        kind: "string"
      }
    }, {
      name: "property",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 236
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getBuckConfig", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 237
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 237
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.build = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 271
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 272
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 272
          },
          kind: "string"
        }
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 273
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 273
          },
          kind: "named",
          name: "BaseBuckBuildOptions"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/build", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 274
        },
        kind: "any"
      });
    });
  };

  remoteModule.install = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 290
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 291
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 291
          },
          kind: "string"
        }
      }
    }, {
      name: "simulator",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 292
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 292
          },
          kind: "string"
        }
      }
    }, {
      name: "runOptions",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 293
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 293
          },
          kind: "named",
          name: "BuckRunOptions"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/install", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 294
        },
        kind: "any"
      });
    });
  };

  remoteModule.buildWithOutput = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 351
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 352
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 352
          },
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 353
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 353
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/buildWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 354
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.testWithOutput = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 370
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 371
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 371
          },
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 372
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 372
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/testWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 373
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.installWithOutput = function (arg0, arg1, arg2, arg3, arg4) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 389
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 390
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 390
          },
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 391
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 391
          },
          kind: "string"
        }
      }
    }, {
      name: "simulator",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 392
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 392
          },
          kind: "string"
        }
      }
    }, {
      name: "runOptions",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 393
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 393
          },
          kind: "named",
          name: "BuckRunOptions"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/installWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 394
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.listAliases = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 469
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/listAliases", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 469
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 469
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.resolveAlias = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 479
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasOrTarget",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 479
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/resolveAlias", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 479
        },
        kind: "string"
      });
    });
  };

  remoteModule.showOutput = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 493
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasOrTarget",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 494
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/showOutput", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 495
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 495
          },
          kind: "named",
          name: "Object"
        }
      });
    });
  };

  remoteModule.buildRuleTypeFor = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 502
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasOrTarget",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 503
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/buildRuleTypeFor", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 504
        },
        kind: "string"
      });
    });
  };

  remoteModule.getHTTPServerPort = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 530
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getHTTPServerPort", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 531
        },
        kind: "number"
      });
    });
  };

  remoteModule.query = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 540
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "queryString",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 541
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/query", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 542
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 542
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.queryWithArgs = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 559
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "queryString",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 560
        },
        kind: "string"
      }
    }, {
      name: "args",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 561
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 561
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/queryWithArgs", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 562
        },
        kind: "object",
        fields: []
      });
    });
  };

  remoteModule.getWebSocketStream = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 580
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "httpPort",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 581
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getWebSocketStream", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 582
        },
        kind: "named",
        name: "Object"
      });
    }).publish();
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
    trackOperationTiming = arguments[1];
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
  }], ["dontRunOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 34
    },
    name: "dontRunOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 34
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 35
        },
        name: "run",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 35
          },
          kind: "boolean-literal",
          value: false
        },
        optional: false
      }]
    }
  }], ["doRunOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 38
    },
    name: "doRunOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 38
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 39
        },
        name: "run",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 39
          },
          kind: "boolean-literal",
          value: true
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 40
        },
        name: "debug",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 40
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["BuckRunOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 43
    },
    name: "BuckRunOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 43
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 34
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 35
          },
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 35
            },
            kind: "boolean-literal",
            value: false
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 38
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 39
          },
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 39
            },
            kind: "boolean-literal",
            value: true
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 40
          },
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 40
            },
            kind: "boolean"
          },
          optional: false
        }]
      }],
      discriminantField: "run"
    }
  }], ["BuckWebSocketMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 45
    },
    name: "BuckWebSocketMessage",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 45
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 45
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 47
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 47
            },
            kind: "string-literal",
            value: "SocketConnected"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 48
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 49
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 49
            },
            kind: "string-literal",
            value: "BuildProgressUpdated"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 50
          },
          name: "progressValue",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 50
            },
            kind: "number"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 51
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 52
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 52
            },
            kind: "string-literal",
            value: "BuildFinished"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 53
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 53
            },
            kind: "number"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 54
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 55
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 55
            },
            kind: "string-literal",
            value: "BuildStarted"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 56
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 57
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 57
            },
            kind: "string-literal",
            value: "ConsoleEvent"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 58
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 58
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 59
          },
          name: "level",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 59
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 60
              },
              name: "name",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 60
                },
                kind: "union",
                types: [{
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 60
                  },
                  kind: "string-literal",
                  value: "OFF"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 60
                  },
                  kind: "string-literal",
                  value: "SEVERE"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 60
                  },
                  kind: "string-literal",
                  value: "WARNING"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 60
                  },
                  kind: "string-literal",
                  value: "INFO"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 60
                  },
                  kind: "string-literal",
                  value: "CONFIG"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 60
                  },
                  kind: "string-literal",
                  value: "FINE"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 60
                  },
                  kind: "string-literal",
                  value: "FINER"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 60
                  },
                  kind: "string-literal",
                  value: "FINEST"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 60
                  },
                  kind: "string-literal",
                  value: "ALL"
                }]
              },
              optional: false
            }]
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 62
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 63
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 63
            },
            kind: "string-literal",
            value: "ParseStarted"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 64
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 65
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 65
            },
            kind: "string-literal",
            value: "ParseFinished"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 66
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 67
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 67
            },
            kind: "string-literal",
            value: "InstallFinished"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 68
          },
          name: "success",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 68
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 69
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 69
            },
            kind: "number"
          },
          optional: true
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 70
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 71
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 71
            },
            kind: "string-literal",
            value: "RunStarted"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 72
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 73
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 73
            },
            kind: "string-literal",
            value: "RunComplete"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 74
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 75
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 75
            },
            kind: "string-literal",
            value: "ResultsAvailable"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 76
          },
          name: "results",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 76
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 77
              },
              name: "buildTarget",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 77
                },
                kind: "object",
                fields: [{
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 78
                  },
                  name: "shortName",
                  type: {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 78
                    },
                    kind: "string"
                  },
                  optional: false
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 79
                  },
                  name: "baseName",
                  type: {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 79
                    },
                    kind: "string"
                  },
                  optional: false
                }]
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 81
              },
              name: "success",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 81
                },
                kind: "boolean"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 82
              },
              name: "failureCount",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 82
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 83
              },
              name: "totalNumberOfTests",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 83
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 84
              },
              name: "testCases",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 84
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 84
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 85
                    },
                    name: "success",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 85
                      },
                      kind: "boolean"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 86
                    },
                    name: "failureCount",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 86
                      },
                      kind: "number"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 87
                    },
                    name: "skippedCount",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 87
                      },
                      kind: "number"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 88
                    },
                    name: "testCaseName",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 88
                      },
                      kind: "string"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 89
                    },
                    name: "testResults",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 89
                      },
                      kind: "array",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 89
                        },
                        kind: "object",
                        fields: [{
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 90
                          },
                          name: "testCaseName",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 90
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 91
                          },
                          name: "testName",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 91
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 92
                          },
                          name: "type",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 92
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 93
                          },
                          name: "time",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 93
                            },
                            kind: "number"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 94
                          },
                          name: "message",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 94
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 95
                          },
                          name: "stacktrace",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 95
                            },
                            kind: "nullable",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 95
                              },
                              kind: "string"
                            }
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 96
                          },
                          name: "stdOut",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 96
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 97
                          },
                          name: "stdErr",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 97
                            },
                            kind: "string"
                          },
                          optional: false
                        }]
                      }
                    },
                    optional: false
                  }]
                }
              },
              optional: false
            }]
          },
          optional: false
        }]
      }],
      discriminantField: "type"
    }
  }], ["BaseBuckBuildOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 104
    },
    name: "BaseBuckBuildOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 104
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 105
        },
        name: "install",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 105
          },
          kind: "boolean"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 106
        },
        name: "test",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 106
          },
          kind: "boolean"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 107
        },
        name: "simulator",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 107
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 107
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 108
        },
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 108
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 108
            },
            kind: "named",
            name: "BuckRunOptions"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 110
        },
        name: "commandOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 110
          },
          kind: "named",
          name: "Object"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 111
        },
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 111
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 111
            },
            kind: "string"
          }
        },
        optional: true
      }]
    }
  }], ["getRootForPath", {
    kind: "function",
    name: "getRootForPath",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 148
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 148
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 148
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 148
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 148
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 148
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }
    }
  }], ["getBuildFile", {
    kind: "function",
    name: "getBuildFile",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 155
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 155
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 155
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "targetName",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 155
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 155
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 155
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 155
            },
            kind: "string"
          }
        }
      }
    }
  }], ["getOwner", {
    kind: "function",
    name: "getOwner",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 215
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 215
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 215
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 215
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 215
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 215
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 215
            },
            kind: "string"
          }
        }
      }
    }
  }], ["getBuckConfig", {
    kind: "function",
    name: "getBuckConfig",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 233
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 233
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 234
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "section",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 235
          },
          kind: "string"
        }
      }, {
        name: "property",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 236
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 237
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 237
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 237
            },
            kind: "string"
          }
        }
      }
    }
  }], ["build", {
    kind: "function",
    name: "build",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 270
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 270
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 271
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 272
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 272
            },
            kind: "string"
          }
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 273
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 273
            },
            kind: "named",
            name: "BaseBuckBuildOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 274
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 274
          },
          kind: "any"
        }
      }
    }
  }], ["install", {
    kind: "function",
    name: "install",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 289
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 289
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 290
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 291
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 291
            },
            kind: "string"
          }
        }
      }, {
        name: "simulator",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 292
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 292
            },
            kind: "string"
          }
        }
      }, {
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 293
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 293
            },
            kind: "named",
            name: "BuckRunOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 294
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 294
          },
          kind: "any"
        }
      }
    }
  }], ["buildWithOutput", {
    kind: "function",
    name: "buildWithOutput",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 350
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 350
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 351
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 352
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 352
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 353
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 353
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 354
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 354
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }
  }], ["testWithOutput", {
    kind: "function",
    name: "testWithOutput",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 369
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 369
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 370
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 371
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 371
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 372
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 372
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 373
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 373
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }
  }], ["installWithOutput", {
    kind: "function",
    name: "installWithOutput",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 388
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 388
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 389
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 390
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 390
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 391
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 391
            },
            kind: "string"
          }
        }
      }, {
        name: "simulator",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 392
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 392
            },
            kind: "string"
          }
        }
      }, {
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 393
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 393
            },
            kind: "named",
            name: "BuckRunOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 394
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 394
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }
  }], ["listAliases", {
    kind: "function",
    name: "listAliases",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 469
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 469
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 469
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 469
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 469
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 469
            },
            kind: "string"
          }
        }
      }
    }
  }], ["resolveAlias", {
    kind: "function",
    name: "resolveAlias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 479
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 479
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 479
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 479
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 479
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 479
          },
          kind: "string"
        }
      }
    }
  }], ["showOutput", {
    kind: "function",
    name: "showOutput",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 492
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 492
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 493
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 494
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 495
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 495
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 495
            },
            kind: "named",
            name: "Object"
          }
        }
      }
    }
  }], ["buildRuleTypeFor", {
    kind: "function",
    name: "buildRuleTypeFor",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 501
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 501
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 502
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 503
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 504
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 504
          },
          kind: "string"
        }
      }
    }
  }], ["getHTTPServerPort", {
    kind: "function",
    name: "getHTTPServerPort",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 529
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 529
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 530
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 531
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 531
          },
          kind: "number"
        }
      }
    }
  }], ["query", {
    kind: "function",
    name: "query",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 539
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 539
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 540
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "queryString",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 541
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 542
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 542
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 542
            },
            kind: "string"
          }
        }
      }
    }
  }], ["queryWithArgs", {
    kind: "function",
    name: "queryWithArgs",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 558
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 558
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 559
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "queryString",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 560
          },
          kind: "string"
        }
      }, {
        name: "args",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 561
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 561
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 562
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 562
          },
          kind: "object",
          fields: []
        }
      }
    }
  }], ["getWebSocketStream", {
    kind: "function",
    name: "getWebSocketStream",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 579
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 579
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 580
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "httpPort",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 581
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 582
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 582
          },
          kind: "named",
          name: "Object"
        }
      }
    }
  }], ["ProcessMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "process-rpc-types.js",
      line: 12
    },
    name: "ProcessMessage",
    definition: {
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 12
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 12
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 13
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 13
            },
            kind: "string-literal",
            value: "stdout"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 15
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "string-literal",
            value: "stderr"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 17
          },
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 18
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 19
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 19
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 20
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 20
            },
            kind: "number"
          },
          optional: false
        }]
      }, {
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
            value: "error"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 23
          },
          name: "error",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            kind: "named",
            name: "Object"
          },
          optional: false
        }]
      }],
      discriminantField: "kind"
    }
  }]])
});