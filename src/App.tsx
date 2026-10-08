import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError, hasRole, type Role, type User } from "@booking/shared/auth";
import { ConnectionPanel } from "@booking/shared/ui/ConnectionPanel";
import { auth, useSession } from "./api";
import { env } from "./env";

const STAFF_ROLES: Role[] = ["ADMIN", "DISPATCHER"];

function errorText(error: unknown): string {
  if (error instanceof ApiError) {
    const fields = error.fieldErrors.map((f) => `${f.field} ${f.message}`).join("; ");
    return `${fields || error.message}${error.requestId ? ` · ref ${error.requestId.slice(0, 8)}` : ""}`;
  }
  return "Unexpected error";
}

function SignIn() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const session = await auth.login(String(form.get("email")).trim(), String(form.get("password")));
      if (!hasRole(session, ...STAFF_ROLES)) {
        await auth.logout();
        setError("This account is not operations staff. Use the customer site instead.");
      }
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="signin">
      <form className="panel signin-card" onSubmit={onSubmit}>
        <p className="eyebrow">Transfers · operations</p>
        <h1 className="signin-title">Sign in to the console</h1>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error && <p className="notice bad" role="alert">{error}</p>}
        <button className="signal" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="muted small">
          First run? The seeded admin's password is printed once in the auth-service log, or set
          <code>AUTH_SEED_ADMIN_PASSWORD</code>.
        </p>
      </form>
    </div>
  );
}

function CreateUser({ onCreated }: { onCreated: () => void }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true);
    setResult(null);
    try {
      const user = await auth.request<User>("/v1/admin/users", {
        method: "POST",
        body: JSON.stringify({
          fullName: String(form.get("fullName")).trim(),
          email: String(form.get("email")).trim(),
          phone: String(form.get("phone") ?? "").trim() || null,
          password: String(form.get("password")),
          roles: [String(form.get("role"))],
        }),
      });
      setResult({ ok: true, text: `Created ${user.email} as ${user.roles.join(", ").toLowerCase()}.` });
      formElement.reset();
      onCreated();
    } catch (e) {
      setResult({ ok: false, text: errorText(e) });
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="panel create" onSubmit={onSubmit}>
      <h2>Add staff or driver</h2>
      <div className="grid">
        <label className="field">
          <span>Full name</span>
          <input name="fullName" required />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" required />
        </label>
        <label className="field">
          <span>Phone</span>
          <input name="phone" type="tel" />
        </label>
        <label className="field">
          <span>Role</span>
          <select name="role" defaultValue="DRIVER">
            <option value="DRIVER">Driver</option>
            <option value="DISPATCHER">Dispatcher</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
        <label className="field">
          <span>Temporary password</span>
          <input name="password" type="text" minLength={10} required autoComplete="off" />
        </label>
      </div>
      {result && <p className={`notice ${result.ok ? "good" : "bad"}`} role="status">{result.text}</p>}
      <button type="submit" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
    </form>
  );
}

function Users() {
  const session = useSession();
  const isAdmin = hasRole(session, "ADMIN");
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    if (!isAdmin) return;
    auth
      .request<User[]>("/v1/admin/users?limit=100")
      .then((list) => {
        setUsers(list);
        setError("");
      })
      .catch((e: unknown) => setError(errorText(e)));
  }, [isAdmin]);
  useEffect(load, [load]);

  if (!isAdmin) {
    return <p className="panel">User management is for admins. Dispatch tools arrive with the dispatch release.</p>;
  }
  return (
    <div className="users">
      <section className="panel">
        <div className="section-head">
          <h2>Accounts</h2>
          <span className="mono muted">{users ? `${users.length} shown` : error ? "unavailable" : "loading"}</span>
        </div>
        {error && <p className="notice bad">{error}</p>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Roles</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td className="mono">{user.email}</td>
                  <td className="mono">{user.phone ?? "—"}</td>
                  <td>
                    {user.roles.map((role) => (
                      <span key={role} className={`tag ${role === "ADMIN" ? "signal" : ""}`}>
                        {role}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <CreateUser onCreated={load} />
    </div>
  );
}

export function App() {
  const session = useSession();
  const signedIn = hasRole(session, ...STAFF_ROLES);
  return (
    <div className="console">
      <header className="topbar">
        <span className="logo">
          TRANSFERS<span>/OPS</span>
        </span>
        {signedIn && session && (
          <div className="who">
            <span className="mono">{session.user.email}</span>
            <button className="secondary" type="button" onClick={() => void auth.logout()}>
              Sign out
            </button>
          </div>
        )}
      </header>
      <main>{signedIn ? <Users /> : <SignIn />}</main>
      <footer className="dev">
        <details>
          <summary className="mono">Backend connection</summary>
          <ConnectionPanel
            buildApiBaseUrl={env.apiBaseUrl}
            buildWebsocketUrl={env.websocketUrl}
            allowOverride={env.allowOverride}
          />
        </details>
      </footer>
    </div>
  );
}
