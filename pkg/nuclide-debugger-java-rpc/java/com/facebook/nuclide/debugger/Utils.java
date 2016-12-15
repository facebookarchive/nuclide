/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.AbsentInformationException;
import com.sun.jdi.Location;
import com.sun.jdi.StackFrame;
import org.json.JSONObject;

import java.net.URI;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Static utility class.
 */
public final class Utils {
  private Utils() {
  }

  public static String getFrameName(StackFrame frame) {
    return String.format("%s.%s+%d",
        frame.location().declaringType().name(),
        frame.location().method().name(),
        frame.location().codeIndex()
    );
  }

  public static JSONObject getBreakpointLocationJson(FileManager fileManager, BreakpointSpec breakpoint) {
    SourceFileSpec sourceFile = fileManager.register(breakpoint.getLocationInfo().filePath);
    return getLocationJson(sourceFile.getScriptId(), breakpoint.getLocationInfo().line);
  }

  public static JSONObject getFrameLocationJson(FileManager fileManager, StackFrame frame) {
    SourceFileSpec fileSpec = fileManager.register(frame.location());
    return getLocationJson(fileSpec.getScriptId(), frame.location().lineNumber());
  }

  private static JSONObject getLocationJson(String scriptId, int lineNumber) {
    JSONObject locationJson = new JSONObject();
    locationJson.put("scriptId", scriptId);
    locationJson.put("lineNumber", lineNumber - 1);  // Chrome lineNumber is 0-based.
    locationJson.put("columnNumber", 0);             // TODO: JDI does not provide column info?
    return locationJson;
  }

  public static Optional<String> getSourcePathFromLocation(Location location) {
    try {
      return Optional.of(location.sourcePath());
    } catch (AbsentInformationException e) {
      // No source code.
      return Optional.empty();
    }
  }

  public static String getFileNameFromPath(String filePath) {
    Path p = Paths.get(filePath);
    return p.getFileName().toString();
  }

  public static String getFilePathFromUrl(String fileUrl) throws IllegalArgumentException {
    URI uri = URI.create(fileUrl);
    String filePath = uri.getPath();
    if (filePath == null) {
      throw new IllegalArgumentException(String.format("Invalid file url: %s", fileUrl));
    }
    return filePath;
  }

  public static void logLine(String message) {
    System.out.println(message);
  }
}
