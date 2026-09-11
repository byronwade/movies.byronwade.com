import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate, x as useRouter, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { i as useCurrentUserState, t as BootScreen } from "./cn-DVA-FXpQ.mjs";
import { t as GROK_PROVIDERS } from "./server-eskmF-2t.mjs";
import { t as Button } from "./button-ChN6QJ9Z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Dkw-HlNe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	const [waited, setWaited] = (0, import_react.useState)(false);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [mode, setMode] = (0, import_react.useState)("up");
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	const nav = useNavigate();
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		if (!isPending) return;
		const t = window.setTimeout(() => setWaited(true), 2e3);
		return () => window.clearTimeout(t);
	}, [isPending]);
	if (isPending && !waited) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	const goHome = async () => {
		await router.invalidate();
		await nav({ to: "/" });
	};
	const submit = async (e) => {
		e.preventDefault();
		setError(null);
		setPending(true);
		try {
			if (mode === "up") {
				const res = await authClient.signUp.email({
					email,
					password,
					name: email.split("@")[0] ?? "viewer",
					callbackURL: "/"
				});
				if (res.error) {
					setError(res.error.message ?? "Could not create the account.");
					return;
				}
			} else {
				const res = await authClient.signIn.email({
					email,
					password,
					callbackURL: "/"
				});
				if (res.error) {
					setError(res.error.message ?? "Could not sign in.");
					return;
				}
			}
			await goHome();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not sign in.");
		} finally {
			setPending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "app-scroll relative grid h-full min-h-0 bg-bg px-5",
		style: { paddingTop: "var(--safe-top)" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto my-auto w-full max-w-sm py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "type-chrome tracking-tight",
					children: "KINO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 type-page",
					children: "Watch first"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 type-content text-body",
					children: "For you is ready. An account saves taste across devices. Grok is only for reading Gmail."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-6 w-full",
					onClick: () => void nav({ to: "/" }),
					children: "Start watching"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "type-caption uppercase tracking-wide text-marker",
						children: "Optional account"
					}), GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						className: "w-full",
						onClick: () => signIn(p.providerId, { callbackURL: "/" }),
						children: ["Continue with ", p.label]
					}, p.providerId))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 type-caption text-marker",
					children: "Or use email"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "mt-2 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "well mt-1 h-12 w-full rounded-full px-4 type-content outline-none",
							placeholder: "Email",
							type: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "well h-12 w-full rounded-full px-4 type-content outline-none",
							placeholder: "Password",
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							required: true,
							minLength: 8
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "type-content text-danger",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "ghost",
							className: "w-full",
							disabled: pending,
							children: pending ? "Working…" : mode === "up" ? "Create account" : "Sign in with email"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex h-11 w-full items-center justify-center type-chrome text-body",
							onClick: () => setMode((m) => m === "in" ? "up" : "in"),
							children: mode === "in" ? "Need an account? Create one" : "Have an account? Sign in"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { Login as component };
