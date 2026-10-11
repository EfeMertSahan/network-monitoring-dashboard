import {
  lazy,
  Suspense,
} from "react";

import {
  Route,
  Routes,
} from "react-router";

import AppLayout from "./components/common/AppLayout";

const Dashboard = lazy(
  () => import("./pages/Dashboard"),
);

const Devices = lazy(
  () => import("./pages/Devices"),
);

const DeviceDetail = lazy(
  () => import("./pages/DeviceDetail"),
);

const Metrics = lazy(
  () => import("./pages/Metrics"),
);

const Alerts = lazy(
  () => import("./pages/Alerts"),
);

const Topology = lazy(
  () => import("./pages/Topology"),
);

function PageLoading() {
  return (
    <div className="grid min-h-[60vh] place-items-center bg-[#050816] text-slate-300">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

        <p className="mt-4 text-sm">
          Sayfa yükleniyor...
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense
      fallback={
        <PageLoading />
      }
    >
      <Routes>
        <Route
          element={
            <AppLayout />
          }
        >
          <Route
            path="/"
            element={
              <Dashboard />
            }
          />

          <Route
            path="/devices"
            element={
              <Devices />
            }
          />

          <Route
            path="/devices/:deviceId"
            element={
              <DeviceDetail />
            }
          />

          <Route
            path="/metrics"
            element={
              <Metrics />
            }
          />

          <Route
            path="/alerts"
            element={
              <Alerts />
            }
          />

          <Route
            path="/topology"
            element={
              <Topology />
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;