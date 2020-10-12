import {
  spawnWrapper,
  wrapperCommandExists,
  WrapperError,
} from "../src/wrapper";
import test from "ava";

test("wrapperCommandExists: nonexistent absolute path", async (t) => {
  t.false(await wrapperCommandExists("/path/to/nonexistent/wrapper"));
});

test("wrapperCommandExists: nonexistent binary in PATH", async (t) => {
  t.false(await wrapperCommandExists("nonexistentbinary"));
});

test("spawnWrapper: specified wrapper doesn't exist", async (t) => {
  await t.throwsAsync(
    spawnWrapper("test", [], { wrapperCommand: "nonexistentWrapper" }),
    {
      instanceOf: WrapperError,
      message: "Wrapper command 'nonexistentWrapper' not found on the system.",
    }
  );
});

test("spawnWrapper: append installation instructions to WrapperError", async (t) => {
  await t.throwsAsync(
    spawnWrapper("test", [], {
      wrapperCommand: "nonexistentWrapper",
      wrapperInstructions: "Invent a wrapper.",
    }),
    {
      instanceOf: WrapperError,
      message:
        "Wrapper command 'nonexistentWrapper' not found on the system. Invent a wrapper.",
    }
  );
});

test("spawnWrapper: passthrough to cross-spawn-promise when no wrapper command is specified", async (t) => {
  t.true((await spawnWrapper("ls", [__dirname])).includes("wrapper.ts"));
});
