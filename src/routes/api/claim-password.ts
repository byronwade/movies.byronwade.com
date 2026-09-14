import { createFileRoute } from "@tanstack/react-router";
import { randomBytes } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { getSql } from "@/lib/db";
import { rateLimit } from "@/lib/server/rate-limit";

type Body = { email?: string; password?: string };

export const Route = createFileRoute("/api/claim-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body = {};
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ ok: false, code: "bad_request" }, { status: 400 });
        }
        const email = String(body.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(body.password ?? "");
        if (!email.includes("@") || password.length < 8) {
          return Response.json({ ok: false, code: "bad_request" }, { status: 400 });
        }
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "ip";
        if (!rateLimit(`claim:${email}:${ip}`, 8, 10 * 60 * 1000)) {
          return Response.json({ ok: false, code: "rate" }, { status: 429 });
        }
        try {
          const sql = await getSql();
          const users = await sql.query<{ id: string }>(
            `select id from "user" where lower(email) = $1 limit 1`,
            [email],
          );
          const userId = users[0]?.id;
          if (!userId) return Response.json({ ok: false, code: "not_found" });

          const creds = await sql.query<{ id: string; password: string | null }>(
            `select id, password from account where "userId" = $1 and "providerId" = 'credential' limit 1`,
            [userId],
          );
          if (creds[0]?.password) return Response.json({ ok: false, code: "has_password" });

          const oauth = await sql.query<{ id: string }>(
            `select id from account where "userId" = $1 and "providerId" like 'grok-%' limit 1`,
            [userId],
          );
          if (!oauth[0] && !creds[0]) return Response.json({ ok: false, code: "not_found" });

          const hash = await hashPassword(password);
          if (creds[0]) {
            await sql.query(`update account set password = $1, "updatedAt" = now() where id = $2`, [
              hash,
              creds[0].id,
            ]);
          } else {
            const id = randomBytes(18).toString("base64url");
            await sql.query(
              `insert into account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
               values ($1, $2, 'credential', $3, $4, now(), now())`,
              [id, userId, userId, hash],
            );
          }
          return Response.json({ ok: true });
        } catch (err) {
          console.error("[claim-password]", err);
          return Response.json({ ok: false, code: "error" }, { status: 500 });
        }
      },
    },
  },
});
