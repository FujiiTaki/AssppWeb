import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAccountsStore } from "../../store/accounts";
import { storeIdToCountry } from "../../apple/config";
import PageContainer from "../Layout/PageContainer";

export default function AccountList() {
  const { accounts, loading, loadAccounts } = useAccountsStore();

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return (
    <PageContainer
      title="Accounts"
      action={
        <Link
          to="/accounts/add"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Account
        </Link>
      }
    >
      {loading ? (
        <div className="text-center text-gray-500 py-12">
          Loading accounts...
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No accounts added yet.</p>
          <Link
            to="/accounts/add"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first account
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
            <NavLink
              key={account.email}
              to={`/accounts/${encodeURIComponent(account.email)}`}
              className={({ isActive }) =>
                `block bg-white rounded-lg border p-4 transition-colors ${
                  isActive
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {account.firstName} {account.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{account.email}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {storeIdToCountry(account.store) || account.store}
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
