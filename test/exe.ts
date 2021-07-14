import { canRunWindowsExeNatively, WrapperError } from "../src/wrapper";
import {
  determineWineWrapper,
  exeDependencyInstallInstructions,
  spawnExe,
} from "../src/exe";
import { normalizePath } from "../src/normalize-path";
import * as path from "path";
import * as sinon from "sinon";
import test from "ava";

const fixturePath =
  process.env.CSWE_TEST_FIXTURES || path.resolve(__dirname, "fixtures");
// Timeout is in ms. For some bizarre reason, macOS Wine in CI takes forever.
const wineTimeout = process.platform === "darwin" ? 180_000 : 60_000;

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
    t.timeout(wineTimeout, "wine is taking too long to execute");
  }
  const output = await spawnExe(path.join(fixturePath, "hello.exe"));
  t.is(output.trim(), "Hello EXE World");
});

test.serial("runs a Windows binary with arguments", async (t) => {
  t.is(process.env.WINE_BINARY, undefined);
  if (!canRunWindowsExeNatively()) {
    t.timeout(wineTimeout, "wine is taking too long to execute");
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
    t.timeout(wineTimeout, "wine is taking too long to execute");
  }
  const output = await spawnExe(path.join(fixturePath, "hello.exe"), [
    await normalizePath(path.join(fixturePath, "input.txt")),
  ]);
  t.is(
    output.trim().replace(/\r/g, ""),
    "Hello EXE World, arguments passed\nInput\nFile"
  );
});

if (!canRunWindowsExeNatively()) {
  test.serial(
    "runs a Windows binary with a filename argument containing a space",
    async (t) => {
      t.is(process.env.WINE_BINARY, undefined);
      if (!canRunWindowsExeNatively()) {
        t.timeout(wineTimeout, "wine is taking too long to execute");
      }
      const output = await spawnExe(path.join(fixturePath, "hello.exe"), [
        await normalizePath(path.join(fixturePath, "input with space.txt")),
      ]);
      t.is(
        output.trim().replace(/\r/g, ""),
        "Hello EXE World, arguments passed\nInput\nFile With Space"
      );
    }
  );

  test.serial(
    "fails to run a Windows binary with the default wrapper instructions",
    async (t) => {
      process.env.WINE_BINARY = "wine-nonexistent";
      await t.throwsAsync(
        async () => spawnExe(path.join(fixturePath, "hello.exe")),
        {
          instanceOf: WrapperError,
          message: `Wrapper command 'wine-nonexistent' not found on the system. ${exeDependencyInstallInstructions()}`,
        }
      );
    }
  );

  test.serial(
    "fails to run a Windows binary with custom wrapper instructions",
    async (t) => {
      process.env.WINE_BINARY = "wine-nonexistent";
      await t.throwsAsync(
        async () =>
          spawnExe(path.join(fixturePath, "hello.exe"), [], {
            wrapperInstructions: "Custom text.",
          }),
        {
          instanceOf: WrapperError,
          message:
            "Wrapper command 'wine-nonexistent' not found on the system. Custom text.",
        }
      );
    }
  );
}
