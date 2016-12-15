/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.Location;
import org.json.JSONObject;

import java.io.File;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Manages the source files parsed.
 */
public class FileManager {
  // ScriptId => SourceFileSpec.
  private final ConcurrentMap<String, SourceFileSpec> _registeredFiles = new ConcurrentHashMap<>();
  private final ContextManager _contextManager;
  // TODO: change it to something Nuclide won't open.
  private final String DEFAULT_UNKNOWN_SOURCE_PATH = "<N/A>";

  FileManager(ContextManager contextManager) {
    _contextManager = contextManager;
  }

  public SourceFileSpec register(Location location) {
    Optional<String> originalSourcePath = Utils.getSourcePathFromLocation(location);
    String resolvedSourcePath = resolveSourcePath(originalSourcePath);
    return register(resolvedSourcePath);
  }

  public SourceFileSpec register(String sourceFilePath) {
    SourceFileSpec sourceFile = new SourceFileSpec(sourceFilePath);

    _registeredFiles.putIfAbsent(sourceFile.getScriptId(), sourceFile);
    sourceFile = _registeredFiles.get(sourceFile.getScriptId());

    sendScriptParsed(sourceFile);
    return sourceFile;
  }

  // Resolve the original symbol info in location into real file in file system.
  private String resolveSourcePath(Optional<String> originalSourcePath) {
    if (!originalSourcePath.isPresent()) {
      return DEFAULT_UNKNOWN_SOURCE_PATH;
    }

    Optional<File> file = _contextManager.getSourceLocator().findSourceFile(originalSourcePath.get());
    return file.isPresent() ? file.get().getPath() : DEFAULT_UNKNOWN_SOURCE_PATH;
  }

  private void sendScriptParsed(SourceFileSpec file) {
    JSONObject params = new JSONObject();
    params.put("scriptId", file.getScriptId());
    params.put("url", file.getUrl());
    params.put("startLine", 0);
    params.put("startColumn", 0);
    params.put("endLine", 0);
    params.put("endColumn", 0);

    JSONObject message = new JSONObject();
    message.put("method", "Debugger.scriptParsed");
    message.put("params", params);

    _contextManager.getNotificationChannel().send(message.toString());
  }
}
