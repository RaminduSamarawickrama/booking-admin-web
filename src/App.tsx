import { ConnectionPanel } from "@booking/shared/ui/ConnectionPanel";
import { env } from "./env";

export function App() {
  return (
    <main>
      <header className="top">
        <span className="brand">Operations</span>
        <span className="badge">Demo build</span>
      </header>

      <h1>Operations dashboard</h1>
      <p className="lead">
        Bookings, drivers, pricing and live tracking arrive in the next increments. Every admin action is
        authorised by the API with the ADMIN role; this site only displays what the API returns after you sign in.
      </p>

      <ConnectionPanel
        buildApiBaseUrl={env.apiBaseUrl}
        buildWebsocketUrl={env.websocketUrl}
        allowOverride={env.allowOverride}
      />
    </main>
  );
}
