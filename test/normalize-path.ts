import { convertUNIXPathToWindows, normalizePath } from "../src/normalize-path";
import isWSL from "is-wsl";
import test from "ava";

if (isWSL) {
  test("convertUNIXPathToWindows: converts a UNIX-style path", async (t) => {
    const actual = await normalizePath("/mnt/c/Windows");
    t.is(actual, "C:\\Windows");
  });

  test("normalizePath: converts input for WSL", async (t) => {
    const actual = await normalizePath("/mnt/c/Windows");
    t.is(actual, "C:\\Windows");
  });

  test("normalizePath: converts input with spaces for WSL", async (t) => {
    const actual = await normalizePath("/mnt/c/Program Files");
    t.is(actual, "C:\\Program Files");
  });
} else {
  test("convertUNIXPathToWindows: fails with human-friendly message about missing wslpath", async (t) => {
    await t.throwsAsync(convertUNIXPathToWindows("/tmp/foo"), {
      message:
        /Error executing command \(wslpath -w \/tmp\/foo\):\nCould not find 'wslpath' in any of the directories listed in the PATH environment variable, which is needed to convert WSL paths to Windows-style paths/,
    });
  });

  test("normalizePath: passes through input for non-WSL", async (t) => {
    const actual = await normalizePath("/tmp/foo");
    t.is(actual, "/tmp/foo");
  });
}
