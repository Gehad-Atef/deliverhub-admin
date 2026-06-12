import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  fetchEscrow,
  releaseEscrow,
  refundEscrow,
} from "../../store/slices/escrowSlice";
import type { EscrowTransaction } from "../../types/escrow";
import type { AppDispatch, RootState } from "../../store";

const statusStyles: Record<string, string> = {
  held: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  released: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  refunded: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  disputed: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
};

const statusKeys = ["all", "held", "released", "refunded", "disputed"];

const EscrowPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { transactions, stats, isLoading } = useSelector(
    (state: RootState) => state.escrow,
  );

  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<EscrowTransaction | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "release" | "refund" | null
  >(null);

  useEffect(() => {
    dispatch(fetchEscrow(statusFilter));
  }, [statusFilter]);

  const handleAction = () => {
    if (!selectedTransaction || !confirmAction) return;
    if (confirmAction === "release") {
      dispatch(releaseEscrow(selectedTransaction.id));
    } else {
      dispatch(refundEscrow(selectedTransaction.id));
    }
    setSelectedTransaction(null);
    setConfirmAction(null);
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      all: t("escrow.all"),
      held: t("escrow.held"),
      released: t("escrow.released"),
      refunded: t("escrow.refunded"),
      disputed: t("escrow.disputed"),
    };
    return map[status] ?? status;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t("escrow.title")}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {stats?.pendingCount} {t("escrow.pendingCount")}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
          <p className="text-xs text-[var(--text-secondary)] mb-1">
            {t("escrow.totalHeld")}
          </p>
          <p className="text-2xl font-bold text-yellow-600">
            EGP {stats?.totalHeld.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {stats?.pendingCount} {t("escrow.pendingCount")}
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
          <p className="text-xs text-[var(--text-secondary)] mb-1">
            {t("escrow.totalReleased")}
          </p>
          <p className="text-2xl font-bold text-green-600">
            EGP {stats?.totalReleased.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 mt-1">↑ 8% vs last week</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
          <p className="text-xs text-[var(--text-secondary)] mb-1">
            {t("escrow.totalRefunded")}
          </p>
          <p className="text-2xl font-bold text-blue-600">
            EGP {stats?.totalRefunded.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">to customers</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
          <p className="text-xs text-[var(--text-secondary)] mb-1">
            {t("escrow.pendingCount")}
          </p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats?.pendingCount}
          </p>
          <p className="text-xs text-yellow-600 mt-1">awaiting release</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-1 w-fit">
          {statusKeys.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition
                ${
                  statusFilter === s
                    ? "bg-blue-600 text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]"
                }`}
            >
              {getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <svg
              className="animate-spin w-8 h-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("escrow.trackingNumber")}
                </th>
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("escrow.customer")}
                </th>
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("escrow.driver")}
                </th>
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("escrow.amount")}
                </th>
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("escrow.status")}
                </th>
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("escrow.date")}
                </th>
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("escrow.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition"
                >
                  {/* Tracking Number */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-medium text-blue-600">
                      {transaction.trackingNumber}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                    {transaction.customerName}
                  </td>

                  {/* Driver */}
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {transaction.driverName}
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      EGP {transaction.amount}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium
                      ${statusStyles[transaction.status]}`}
                    >
                      {getStatusLabel(transaction.status)}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    {transaction.status === "held" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setConfirmAction("release");
                          }}
                          className="text-xs font-medium text-green-600 hover:text-green-800 transition"
                        >
                          {t("escrow.release")}
                        </button>
                        <span className="text-[var(--border-color)]">|</span>
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setConfirmAction("refund");
                          }}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
                        >
                          {t("escrow.refund")}
                        </button>
                      </div>
                    )}
                    {transaction.status === "disputed" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setConfirmAction("release");
                          }}
                          className="text-xs font-medium text-green-600 hover:text-green-800 transition"
                        >
                          {t("escrow.release")}
                        </button>
                        <span className="text-[var(--border-color)]">|</span>
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setConfirmAction("refund");
                          }}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
                        >
                          {t("escrow.refund")}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirm Modal */}
      {selectedTransaction && confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {confirmAction === "release"
                ? t("escrow.confirmRelease")
                : t("escrow.confirmRefund")}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              {confirmAction === "release"
                ? t("escrow.releaseMessage")
                : t("escrow.refundMessage")}
            </p>
            <div className="flex items-center gap-2 mb-6 p-3 bg-[var(--bg-primary)] rounded-xl">
              <span className="text-sm font-mono text-blue-600">
                {selectedTransaction.trackingNumber}
              </span>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                EGP {selectedTransaction.amount}
              </span>
            </div>

            <button
              onClick={handleAction}
              className={`w-full py-2.5 rounded-lg text-sm font-medium text-white transition mb-2
                ${
                  confirmAction === "release"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {t("escrow.confirm")}
            </button>
            <button
              onClick={() => {
                setSelectedTransaction(null);
                setConfirmAction(null);
              }}
              className="w-full py-2.5 rounded-lg text-sm text-[var(--text-muted)]
                hover:bg-[var(--bg-primary)] transition"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscrowPage;
