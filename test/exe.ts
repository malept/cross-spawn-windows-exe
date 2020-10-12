import { canRunWindowsExeNatively } from "../src/wrapper";
import { determineWineWrapper, spawnExe } from "../src/exe";
import { normalizePath } from "../src/normalize-path";
import * as path from "path";
import * as sinon from "sinon";
import test from "ava";

const fixturePath = path.resolve(__dirname, "fixtures");

// Tests are serial because changing environment variables isn't threadsafe.

test.afterEach(() => {
  delete process.env.WINE_BINARY;
  sinon.restore();
});

test.serial("determineWineWrapper uses the custom path if supplied", (t) => {
  process.env.WINE_BINARY = "wine-binary";
  t.is(determineWineWrapper("foo"), "foo");
});

test.serial(
  "determineWineWrapper uses the WINE_BINARY environment variable if supplied",
  (t) => {
    process.env.WINE_BINARY = "wine-binary";
    t.is(determineWineWrapper(), "wine-binary");
  }
);

test.serial(
  "determineWineWrapper falls back to the wine64 binary on 64-bit platforms if no other paths are supplied",
  (t) => {
    sinon.stub(process, "arch").value("x64");
    t.is(determineWineWrapper(), "wine64");
  }
);

test.serial(
  "determineWineWrapper falls back to the wine binary on non-64-bit platforms if no other paths are supplied",
  (t) => {
    sinon.stub(process, "arch").value("ia32");
    t.is(determineWineWrapper(), "wine");
  }
);

test.serial("runs a Windows binary", async (t) => {
  t.is(process.env.WINE_BINARY, undefined);
  if (!canRunWindowsExeNatively()) {
    t.timeout(20_000, "wine is taking too long to execute");
  }
  const output = await spawnExe(path.join(fixturePath, "hello.exe"));
  t.is(output.trim(), "Hello EXE World");
});

test.serial("runs a Windows binary with arguments", async (t) => {
  t.is(process.env.WINE_BINARY, undefined);
  if (!canRunWindowsExeNatively()) {
    t.timeout(10_000, "wine is taking too long to execute");
  }
  const output = await spawnExe(path.join(fixturePath, "hello.exe"), [
    "argument.txt",
  ]);
  t.is(
    output.trim().replace(/\r/g, ""),
    "Hello EXE World, arguments passed\nERROR: could not open file"
  );
});

test.serial("runs a Windows binary with a filename argument", async (t) => {
  t.is(process.env.WINE_BINARY, undefined);
  if (!canRunWindowsExeNatively()) {
    t.timeout(10_000, "wine is taking too long to execute");
  }
  const output = await spawnExe(path.join(fixturePath, "hello.exe"), [
    await normalizePath(path.join(fixturePath, "input.txt")),
  ]);
  t.is(
    output.trim().replace(/\r/g, ""),
    "Hello EXE World, arguments passed\nInput\nFile"
  );
});
