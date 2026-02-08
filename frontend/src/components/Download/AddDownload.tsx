import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../Layout/PageContainer";
import AppIcon from "../common/AppIcon";
import { useAccounts } from "../../hooks/useAccounts";
import { useSettingsStore } from "../../store/settings";
import { lookupApp } from "../../api/search";
import { getDownloadInfo } from "../../apple/download";
import { purchaseApp } from "../../apple/purchase";
import { listVersions } from "../../apple/versionFinder";
import { apiPost } from "../../api/client";
import { countryCodeMap } from "../../apple/config";
import {
  accountHash,
  accountStoreCountry,
  firstAccountCountry,
} from "../../utils/account";
import type { Software } from "../../types";

const sortedCountries = Object.keys(countryCodeMap).sort();

export default function AddDownload() {
  const navigate = useNavigate();
  const { accounts, updateAccount } = useAccounts();
  const { defaultCountry } = useSettingsStore();

  const [bundleId, setBundleId] = useState("");
  const [country, setCountry] = useState(defaultCountry);
  const [countryTouched, setCountryTouched] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [app, setApp] = useState<Software | null>(null);
  const [versions, setVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [step, setStep] = useState<"lookup" | "ready" | "versions">("lookup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].email);
    }
  }, [accounts, selectedAccount]);

  const account = accounts.find((a) => a.email === selectedAccount);
  const autoCountry =
    accountStoreCountry(account) ?? firstAccountCountry(accounts);

  useEffect(() => {
    if (countryTouched) return;
    const nextCountry = autoCountry ?? defaultCountry;
    if (nextCountry && nextCountry !== country) {
      setCountry(nextCountry);
    }
  }, [autoCountry, country, countryTouched, defaultCountry]);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!bundleId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await lookupApp(bundleId.trim(), country);
      if (!result) {
        setError("App not found");
        return;
      }
      setApp(result);
      setStep("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGetLicense() {
    if (!account || !app) return;
    setLoading(true);
    setError("");
    try {
      const result = await purchaseApp(account, app);
      await updateAccount({ ...account, cookies: result.updatedCookies });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get license");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadVersions() {
    if (!account || !app) return;
    setLoading(true);
    setError("");
    try {
      const result = await listVersions(account, app);
      setVersions(result.versions);
      await updateAccount({ ...account, cookies: result.updatedCookies });
      setStep("versions");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load versions");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!account || !app) return;
    setLoading(true);
    setError("");
    try {
      const { output, updatedCookies } = await getDownloadInfo(
        account,
        app,
        selectedVersion || undefined,
      );
      await updateAccount({ ...account, cookies: updatedCookies });
      const hash = await accountHash(account);
      await apiPost("/api/downloads", {
        software: app,
        accountHash: hash,
        downloadURL: output.downloadURL,
        sinfs: output.sinfs,
        iTunesMetadata: output.iTunesMetadata,
      });
      navigate("/downloads");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer title="New Download">
      <div className="max-w-lg space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bundle ID
            </label>
            <input
              type="text"
              value={bundleId}
              onChange={(e) => setBundleId(e.target.value)}
              placeholder="com.example.app"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div className="flex gap-3">
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setCountryTouched(true);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            >
              {sortedCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {accounts.length > 0 && (
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                {accounts.map((a) => (
                  <option key={a.email} value={a.email}>
                    {a.firstName} {a.lastName}
                  </option>
                ))}
              </select>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !bundleId.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading && step === "lookup" ? "Looking up..." : "Look Up"}
          </button>
        </form>

        {app && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4 mb-4">
              <AppIcon url={app.artworkUrl} name={app.name} size="md" />
              <div>
                <p className="font-medium text-gray-900">{app.name}</p>
                <p className="text-sm text-gray-500">{app.artistName}</p>
                <p className="text-sm text-gray-400">
                  v{app.version} - {app.formattedPrice ?? "Free"}
                </p>
              </div>
            </div>

            {step === "versions" && versions.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version (optional)
                </label>
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Latest</option>
                  {versions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(app.price === undefined || app.price === 0) && (
                <button
                  onClick={handleGetLicense}
                  disabled={loading || !account}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Get License
                </button>
              )}
              {step !== "versions" && (
                <button
                  onClick={handleLoadVersions}
                  disabled={loading || !account}
                  className="px-3 py-1.5 text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Select Version
                </button>
              )}
              <button
                onClick={handleDownload}
                disabled={loading || !account}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Processing..." : "Download"}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
