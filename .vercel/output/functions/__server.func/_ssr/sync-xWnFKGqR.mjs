import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-C66df2GZ.mjs";
import { Wt as custom, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as getSql } from "./db-LiLrRnNM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sync-xWnFKGqR.js
var Payload = object({ payload: custom() });
function asPayload(raw) {
	if (raw == null) return null;
	if (typeof raw === "string") try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
	return raw;
}
var pullKinoState_createServerFn_handler = createServerRpc({
	id: "dd61b80e7e8b6581fc8b8b1749bc3bf06cd64556a7f7dead94015fd3542e7d47",
	name: "pullKinoState",
	filename: "src/lib/server/sync.ts"
}, (opts) => pullKinoState.__executeServer(opts));
var pullKinoState = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({}).parse(input ?? {})).handler(pullKinoState_createServerFn_handler, async ({ context }) => {
	return { payload: asPayload((await (await getSql()).query("select payload from kino_state where user_id = $1 limit 1", [context.userId]))[0]?.payload) };
});
var pushKinoState_createServerFn_handler = createServerRpc({
	id: "ebc8f5eae66de4bb06ac5b7dbdebb422b6be92d68616939a83fd079b9e3845af",
	name: "pushKinoState",
	filename: "src/lib/server/sync.ts"
}, (opts) => pushKinoState.__executeServer(opts));
var pushKinoState = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => Payload.parse(input)).handler(pushKinoState_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const json = JSON.stringify(data.payload ?? {});
	await sql.query(`insert into kino_state (user_id, payload, updated_at)
       values ($1, $2::jsonb, now())
       on conflict (user_id) do update set payload = excluded.payload, updated_at = now()`, [context.userId, json]);
	return { ok: true };
});
//#endregion
export { pullKinoState_createServerFn_handler, pushKinoState_createServerFn_handler };
