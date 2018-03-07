#include <array>
#include <fstream>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>

using namespace std;

// For now this assumes everything is valid, it assumes it takes 3 command
// line parameters:
//   - Input JSON compilation DB file path.
//   - Output JSON compilation DB file path.
//   - Output new headers map file path.
// It assumes the input is valid JSON and looks for a line which is `"-I",` and
// the next line contains a string that ends with `.hmap",`.
// These ".hmap" files are the files which will be compressed, and will be
// replaced by a single header file which will be produced.
// Also it assumes this is installed: https://github.com/milend/hmap

// Here's how it was tested:
//   g++ MergeHeaderMaps.cpp -o MergeHeaderMaps -O3 -std=c++14
//   ./MergeHeaderMaps <COMPILE_DB_PATH> <OUT_COMPILE_DP_PATH> \
//     <OUT_HEADERS_MAP_FILE_PATH>

// Trims leading spaces.
string TrimStart(const string& str) {
  int i = 0;
  while (i < str.size() && isspace(str[i])) {
    ++i;
  }
  return str.substr(i);
}

// Trims trailing spaces.
string TrimEnd(const string& str) {
  int i = str.size();
  while (i > 0 && isspace(str[i - 1])) {
    --i;
  }
  return str.substr(0, i);
}

// Checks if the given string ends with the given suffix.
bool EndsWith(const string& str, const string& suffix) {
  int i = str.length() - 1;
  int j = suffix.length() - 1;
  for (; i >= 0 && j >= 0; --i, --j) {
    if (str[i] != suffix[j]) {
      return false;
    }
  }
  return j == -1;
}

// Executes the given command and returns its output as a string.
string Execute(const string& cmd) {
  array<char, 128> buffer;
  string result;
  shared_ptr<FILE> pipe(popen(cmd.c_str(), "r"), pclose);
  if (!pipe) {
    throw runtime_error("popen() failed.");
  }
  while (!feof(pipe.get())) {
    if (fgets(buffer.data(), 128, pipe.get()) != nullptr) {
      result += buffer.data();
    }
  }
  return result;
}

// Splits the given string using the given separator and puts the result strings
// in the given vector.
void Split(const string& str, const string& pat, vector<string>* result) {
  int last = 0;
  for (int i = 0; i < str.length(); ++i) {
    int j = 0;
    for (; i + j < str.length() && j < pat.length(); ++j) {
      if (str[i + j] != pat[j]) {
        break;
      }
    }
    if (j == pat.length()) {
      const string& part = str.substr(last, i - last);
      if (!part.empty()) {
        result->push_back(part);
      }
      last = i + j;
      i += j - 1;
    }
  }
  const string& part = str.substr(last);
  if (!part.empty()) {
    result->push_back(part);
  }
}

// Reads and stores the headers in a single map file.
void ProcessSingleFile(
    const string& path,
    unordered_map<string, string>* all_headers) {
  const string& lines = Execute("hmap print " + path);
  vector<string> headers;
  Split(lines, "\n", &headers);
  for (const string& header : headers) {
    vector<string> key_value;
    Split(header, " -> ", &key_value);
    if (key_value.size() != 2) {
      throw runtime_error("Invalid header entry.");
    }
    const string& key = key_value[0];
    const string& value = key_value[1];
    auto old_value = all_headers->find(key);
    if (old_value != all_headers->end()) {
      if (old_value->second != value) {
        throw runtime_error("Multiple values for the same key.");
      }
    } else {
      all_headers->insert({key, value});
    }
  }
}

// Just replaces each / with \/.
// Should be done better once this is exposed to other libs.
string ProperJSON(const string& str) {
  string result = "";
  int last = 0;
  for (int i = 0; i <= str.length(); ++i) {
    if (i == str.length() || str[i] == '/') {
      result += str.substr(last, i - last);
      if (i < str.length()) {
        result += "\\/";
      }
      last = i + 1;
      continue;
    }
  }
  return result;
}

// Prints all headers in JSON format.
// Should be done better once this is exposed to other libs.
void PrintToJSON(
    const unordered_map<string, string>& all_headers,
    const string& out_path) {
  ofstream out_json_file(out_path.c_str());
  out_json_file << "{\n";
  int cur = 0;
  for (const auto& header : all_headers) {
    out_json_file << "  \"" << ProperJSON(header.first) << "\" : {\n";
    size_t last_ind = header.second.find_last_of("/");
    if (last_ind == string::npos) {
      throw runtime_error("Invalid header value.");
    }
    out_json_file << "    \"prefix\" : \""
                  << ProperJSON(header.second.substr(0, last_ind + 1))
                  << "\",\n";
    out_json_file << "    \"suffix\" : \"" << header.second.substr(last_ind + 1)
                  << "\"\n";
    out_json_file << "  }";
    if (cur + 1 != all_headers.size()) {
      out_json_file << ",";
    }
    out_json_file << "\n";
    ++cur;
  }
  out_json_file << "}";
  out_json_file.close();
}

int main(int argc, char** argv) {
  ifstream in_db_file(argv[1]);
  ofstream out_db_file(argv[2]);
  string line, path;
  bool first_include = true;
  unordered_map<string, string> all_headers;
  while (getline(in_db_file, line)) {
    line = TrimEnd(line);
    if (TrimStart(line) == "\"-I\",") {
      if (getline(in_db_file, path)) {
        path = TrimEnd(path);
        if (EndsWith(path, ".hmap\",")) {
          if (first_include) {
            first_include = false;
            out_db_file << line << endl;
            out_db_file << "    \"" << argv[3] << "\"," << endl;
          }
          path = TrimStart(path);
          // Removing the " at the beginning and the ", at the end.
          path = path.substr(1, path.length() - 3);
          ProcessSingleFile(path, &all_headers);
        } else {
          out_db_file << line << endl;
          out_db_file << path << endl;
        }
      } else {
        out_db_file << line << endl;
      }
    } else {
      out_db_file << line << endl;
    }
  }
  in_db_file.close();
  out_db_file.close();

  const string& out_json_path = string(argv[3]) + ".json";
  PrintToJSON(all_headers, out_json_path);

  cout << Execute("hmap convert " + out_json_path + " " + argv[3]);
  return 0;
}
