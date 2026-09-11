import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as signOut, r as signIn } from "./client-B40BzJxt.mjs";
import { i as useCurrentUserState, n as cn, r as useCurrentUser } from "./cn-DVA-FXpQ.mjs";
import { a as STREAMING_SERVICES, d as useKino, i as SAMPLE_LIBRARY, t as AppShell } from "./shell-DvR4XdT7.mjs";
import { n as profileSummary, t as TasteGraph } from "./graph--ws7dxQV.mjs";
import { t as Workbench } from "./workbench-CSbQ71gy.mjs";
import { r as redirectToLoginIfRequired, t as connectorLoginUrl } from "./login-CTtj0eor.mjs";
import { a as hasGateSessionMarker, t as GROK_PROVIDERS } from "./server-eskmF-2t.mjs";
import { n as buttonVariants, t as Button } from "./button-ChN6QJ9Z.mjs";
import { n as GroupRow, r as NativeSwitch, t as Group } from "./ios-gJAH5UQi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-ZmPxbILS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function resolveSignInGateState(input) {
	if (input.isPending) return "pending";
	return input.hasUser ? "signed_in" : "signed_out";
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
function SignInGate({ children, fallback }) {
	const { user, isPending } = useCurrentUserState();
	const state = resolveSignInGateState({
		isPending,
		hasUser: user !== null
	});
	if (state === "pending") return null;
	if (state === "signed_in") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: fallback ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInButtons, {}) });
}
function SignInButtons() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex w-full max-w-sm flex-col gap-2",
		children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => signIn(p.providerId, { callbackURL: "/" }),
			className: "w-full cursor-pointer rounded-md border border-neutral-300 px-4 py-2 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900",
			children: ["Continue with ", p.label]
		}, p.providerId))
	});
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
function TasteAccount() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInGate, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/login",
			className: "type-chrome text-accent",
			children: "Sign in"
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
	});
}
function Profile() {
	const taste = useKino((s) => s.taste);
	const events = useKino((s) => s.events);
	const services = useKino((s) => s.services);
	const setServices = useKino((s) => s.setServices);
	const profiles = useKino((s) => s.profiles);
	const activeProfileId = useKino((s) => s.activeProfileId);
	const setActiveProfile = useKino((s) => s.setActiveProfile);
	const renameProfile = useKino((s) => s.renameProfile);
	const importText = useKino((s) => s.importText);
	const scanMail = useKino((s) => s.scanMail);
	const importing = useKino((s) => s.importing);
	const scanning = useKino((s) => s.scanning);
	const pendingAsks = useKino((s) => s.pendingAsks);
	const englishOnly = useKino((s) => s.englishOnly);
	const setEnglishOnly = useKino((s) => s.setEnglishOnly);
	const [fileNote, setFileNote] = (0, import_react.useState)(null);
	const [paste, setPaste] = (0, import_react.useState)("");
	const [username, setUsername] = (0, import_react.useState)("");
	const [importError, setImportError] = (0, import_react.useState)(null);
	const [mailNote, setMailNote] = (0, import_react.useState)(null);
	const [mailLogin, setMailLogin] = (0, import_react.useState)();
	const runImport = async (text) => {
		setImportError(null);
		const res = await importText({
			text: text ?? paste,
			username
		});
		if (!res.ok) setImportError(res.error ?? "Nothing imported.");
		else {
			setPaste("");
			setFileNote(`${res.count} title${res.count === 1 ? "" : "s"} mapped onto the catalog.`);
		}
	};
	const onFile = async (file) => {
		const text = await file.text();
		setFileNote(`Read ${file.name}`);
		await runImport(text);
	};
	const runScan = async () => {
		setMailNote(null);
		setMailLogin(void 0);
		const res = await scanMail();
		if (res.loginRequired) {
			setMailLogin(res.loginUrl);
			setMailNote("Continue with Grok so this window can read Gmail.");
			return;
		}
		if (!res.ok) {
			setMailNote(res.error ?? "Scan did not finish.");
			return;
		}
		setMailNote(res.count ? `${res.count} titles from mail.` : res.error ?? "Gmail connected. No catalog titles in tickets yet.");
	};
	(0, import_react.useEffect)(() => {
		const retry = () => {
			try {
				if (sessionStorage.getItem("kino.mail.grok") !== "1") return;
				sessionStorage.removeItem("kino.mail.grok");
			} catch {
				return;
			}
			runScan();
		};
		window.addEventListener("focus", retry);
		window.addEventListener("pageshow", retry);
		return () => {
			window.removeEventListener("focus", retry);
			window.removeEventListener("pageshow", retry);
		};
	}, [scanMail]);
	const href = connectorLoginUrl(mailLogin) ?? "https://gate.grok.me/__gate/signin";
	const showGrok = Boolean(mailLogin) || Boolean(mailNote?.includes("Continue with Grok"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Workbench, {
		title: "Taste",
		trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TasteAccount, {}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "type-content text-body",
				children: profileSummary(taste)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono type-caption text-marker",
				children: [
					events.length,
					" events · ",
					profiles.find((p) => p.id === activeProfileId)?.name
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Group, {
				header: "Household",
				className: "mt-8",
				children: profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupRow, {
					label: p.name,
					detail: activeProfileId === p.id ? "On" : void 0,
					onClick: () => setActiveProfile(p.id)
				}, p.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 px-1 type-caption text-body",
				children: ["Kids’ tickets stay off your graph. Switch profile to rank as Partner or Kids.", pendingAsks.length ? ` ${pendingAsks.length} film${pendingAsks.length === 1 ? "" : "s"} waiting on “who watched.”` : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-2",
				children: profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					"aria-label": `Rename ${p.kind}`,
					defaultValue: p.name,
					onBlur: (e) => {
						const n = e.target.value.trim();
						if (n) renameProfile(p.id, n);
					},
					className: "well h-10 min-w-0 flex-1 rounded-full px-3 type-caption outline-none"
				}, p.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Group, {
				header: "Language",
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupRow, {
					label: "English only",
					trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSwitch, {
						checked: englishOnly,
						onChange: setEnglishOnly,
						label: "English only"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 px-1 type-caption text-body",
				children: "Keep For you and Tonight in English. Search still finds the rest."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 px-1 type-caption uppercase tracking-wide text-marker",
						children: "Taste graph"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "group px-4 py-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TasteGraph, { taste })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/algorithm",
						className: "mt-2 inline-flex type-caption text-accent",
						children: "Evidence"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-2 px-1 type-caption uppercase tracking-wide text-marker",
						children: "Supercharge"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 px-1 type-caption text-body",
						children: "Netflix viewing-history CSV, a Letterboxd export, a public username, or paste titles. Enough to make the next ten good."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: importing,
						onClick: () => void runImport(SAMPLE_LIBRARY),
						children: importing ? "Importing…" : "Load sample watches"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "kino-csv",
						type: "file",
						accept: ".csv,text/csv,text/plain",
						className: "kino-file",
						onChange: (e) => {
							const f = e.target.files?.[0];
							if (f) onFile(f);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "kino-csv",
						className: "press well mt-3 flex h-12 w-full cursor-pointer items-center justify-center rounded-full type-content",
						children: "Upload Netflix or Letterboxd"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: username,
						onChange: (e) => setUsername(e.target.value),
						placeholder: "letterboxd username",
						className: "well mt-3 h-12 w-full rounded-full px-4 type-content outline-none placeholder:text-marker"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: paste,
						onChange: (e) => setPaste(e.target.value),
						placeholder: "Annihilation, The Lighthouse, Dune: Part Two",
						rows: 4,
						className: "group mt-3 w-full resize-none px-4 py-3 type-content outline-none placeholder:text-marker"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 w-full",
						variant: "ghost",
						disabled: importing,
						onClick: () => void runImport(),
						children: importing ? "Importing…" : "Import watches"
					}),
					importError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 type-content text-danger",
						children: importError
					}) : null,
					fileNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 type-caption text-body",
						children: fileNote
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-2 px-1 type-caption uppercase tracking-wide text-marker",
						children: "Streaming"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 px-1 type-caption text-body",
						children: "What you pay for. A bounded bump — never the whole rank."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: STREAMING_SERVICES.map((s) => {
							const on = services.includes(s);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setServices(on ? services.filter((x) => x !== s) : [...services, s]),
								className: cn("press h-7 rounded-full px-3 type-chrome", on ? "commit" : "well"),
								children: s
							}, s);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 px-1 type-caption text-body",
						children: scanning ? "Reading Gmail…" : mailNote ?? "Tickets and rentals from Fandango, AMC, Netflix. Scan uses this window’s Grok connection."
					}),
					showGrok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href,
						target: "_blank",
						rel: "noopener noreferrer",
						className: cn(buttonVariants(), "mt-3 w-full"),
						onClick: (e) => {
							try {
								sessionStorage.setItem("kino.mail.grok", "1");
							} catch {}
							if (redirectToLoginIfRequired({
								ok: false,
								data: null,
								loginRequired: true,
								loginUrl: href
							})) e.preventDefault();
						},
						children: "Continue with Grok"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 w-full",
						variant: showGrok ? "ghost" : void 0,
						disabled: scanning,
						onClick: () => void runScan(),
						children: scanning ? "Reading mail…" : "Scan Gmail"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Group, {
				header: "Privacy",
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupRow, {
					label: "Spoiler-safe reviews",
					trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSwitch, {
						checked: true,
						onChange: () => void 0,
						label: "Spoiler-safe"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 px-1 type-caption leading-relaxed text-marker",
				children: "Preference events belong to this device, then this account once you sign in. TasteRank reads For you, Saved, Search, Taste, mail, and lists you import."
			})
		]
	}) });
}
//#endregion
export { Profile as component };
