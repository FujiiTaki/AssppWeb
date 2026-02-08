import { useState, useEffect } from "react";
import PageContainer from "../Layout/PageContainer";
import { countryCodeMap } from "../../apple/config";

interface ServerInfo {
  version?: string;
  uptime?: number;
  dataDir?: string;
}

const countryNames: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
  CN: "China",
  KR: "South Korea",
  BR: "Brazil",
  IN: "India",
  IT: "Italy",
  ES: "Spain",
  MX: "Mexico",
  NL: "Netherlands",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  CH: "Switzerland",
  AT: "Austria",
  BE: "Belgium",
  IE: "Ireland",
  NZ: "New Zealand",
  SG: "Singapore",
  HK: "Hong Kong",
  TW: "Taiwan",
  TH: "Thailand",
  PH: "Philippines",
  MY: "Malaysia",
  ID: "Indonesia",
  VN: "Vietnam",
  RU: "Russia",
  PL: "Poland",
  CZ: "Czech Republic",
  TR: "Turkey",
  SA: "Saudi Arabia",
  AE: "UAE",
  IL: "Israel",
  ZA: "South Africa",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
  PT: "Portugal",
  GR: "Greece",
  FI: "Finland",
  HU: "Hungary",
  RO: "Romania",
  EG: "Egypt",
  PK: "Pakistan",
  NG: "Nigeria",
};

const entityTypes = [
  { value: "software", label: "iPhone" },
  { value: "iPadSoftware", label: "iPad" },
];

function getCountryLabel(code: string): string {
  return countryNames[code] || code;
}

export default function SettingsPage() {
  const [country, setCountry] = useState(
    () => localStorage.getItem("asspp-default-country") || "US",
  );
  const [entity, setEntity] = useState(
    () => localStorage.getItem("asspp-default-entity") || "software",
  );
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);

  useEffect(() => {
    localStorage.setItem("asspp-default-country", country);
  }, [country]);

  useEffect(() => {
    localStorage.setItem("asspp-default-entity", entity);
  }, [entity]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then(setServerInfo)
      .catch(() => setServerInfo(null));
  }, []);

  const sortedCountries = Object.keys(countryCodeMap).sort((a, b) =>
    getCountryLabel(a).localeCompare(getCountryLabel(b)),
  );

  return (
    <PageContainer title="Settings">
      <div className="space-y-6">
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Defaults</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Default Country / Region
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {sortedCountries.map((code) => (
                  <option key={code} value={code}>
                    {getCountryLabel(code)} ({code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="entity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Default Entity Type
              </label>
              <select
                id="entity"
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {entityTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Server</h2>
          {serverInfo ? (
            <dl className="space-y-3">
              {serverInfo.version && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Version</dt>
                  <dd className="text-sm text-gray-900">
                    {serverInfo.version}
                  </dd>
                </div>
              )}
              {serverInfo.dataDir && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Data Directory
                  </dt>
                  <dd className="text-sm text-gray-900 font-mono">
                    {serverInfo.dataDir}
                  </dd>
                </div>
              )}
              {serverInfo.uptime != null && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Uptime</dt>
                  <dd className="text-sm text-gray-900">
                    {formatUptime(serverInfo.uptime)}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-gray-500">
              Unable to connect to server.
            </p>
          )}
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data</h2>
          <p className="text-sm text-gray-600 mb-4">
            Clear all local data including accounts, credentials, and settings
            stored in this browser.
          </p>
          <button
            onClick={() => {
              if (
                !confirm(
                  "This will delete all accounts, credentials, and settings. This cannot be undone. Continue?",
                )
              )
                return;
              localStorage.clear();
              indexedDB.deleteDatabase("asspp-accounts");
              window.location.href = "/";
            }}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Reset All Data
          </button>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
          <p className="text-sm text-gray-600">
            Asspp Web -- a web-based interface for managing Apple app downloads
            and licenses.
          </p>
          <p className="mt-2 text-xs text-gray-400">v0.0.1</p>
        </section>
      </div>
    </PageContainer>
  );
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}
