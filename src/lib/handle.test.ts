import assert from "node:assert/strict";
import { collisionPath, handleError, handlePath, handleUrl, normalizeHandle, splitHandles, suggestedHandle } from "./handle.ts";
import { test } from "node:test";

test("normalizes and rejects bad handles", () => {
  assert.equal(normalizeHandle("@Byron"), "byron");
  assert.equal(handleError("by"), "At least 3 letters.");
  assert.equal(handleError("live"), "That name is reserved.");
  assert.equal(handleError("movies"), "That name is reserved.");
  assert.equal(handleError("byron"), null);
  assert.equal(handleUrl("byron"), "movies.byronwade.com/u/byron");
  assert.equal(handlePath("byron"), "/u/byron");
  assert.deepEqual(splitHandles("you+@sam"), ["you", "sam"]);
  assert.equal(collisionPath("you", "sam"), "/u/you+sam");
  assert.equal(suggestedHandle("Byron Wade"), "byron");
  assert.equal(suggestedHandle("Al"), "");
});
