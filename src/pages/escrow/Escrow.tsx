import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Shield, CheckCircle, RotateCcw, Clock } from "lucide-react";
import {
  fetchEscrow,
  releaseEscrow,
  refundEscrow,
} from "../../store/slices/escrowSlice";
import type { EscrowTransaction } from "../../types/escrow";
import type { AppDispatch, RootState } from "../../store";
import { StatCard } from "../../components/shared/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";

// ─── Badge maps ───────────────────────────────────────────────────────────────
const statusBadge: Record<
  string,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  held: "amber",
  released: "green",
  refunded: "blue",
  disputed: "red",
};

const statusKeys = ["all", "held", "released", "refunded", "disputed"];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`bg-[var(--bg-primary)] rounded-lg animate-pulse ${className}`}
  />
);

const EscrowSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-7 w-44" />
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-[100px]" />
      ))}
    </div>
    <Skeleton className="h-[380px]" />
  </div>
);

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal: React.FC<{
  transaction: EscrowTransaction;
  action: "release" | "refund";
  onConfirm: () => void;
  onClose: () => void;
  actionLoading: boolean;
}> = ({ transaction, action, onConfirm, onClose, actionLoading }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      dir={isRTL ? "rtl" : "ltr"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-sm sm:mx-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-t-2xl sm:rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
          <h2 className="font-['Syne',sans-serif] text-[15px] font-semibold text-[var(--text-primary)]">
            {action === "release"
              ? t("escrow.confirmRelease")
              : t("escrow.confirmRefund")}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
          >
            <i className="ti ti-x text-[16px]" />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-[12.5px] text-[var(--text-secondary)] mb-4">
            {action === "release"
              ? t("escrow.releaseMessage")
              : t("escrow.refundMessage")}
          </p>

          <div className="flex items-center gap-2 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg mb-5">
            <span className="text-[12px] font-mono text-blue-500">
              {transaction.trackingNumber}
            </span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-[12.5px] font-medium text-[var(--text-primary)]">
              EGP {transaction.amount}
            </span>
          </div>

          {actionLoading ? (
            <div className="flex justify-center py-2">
              <Spinner size="md" />
            </div>
          ) : (
            <button
              onClick={onConfirm}
              className={`w-full py-2.5 rounded-lg text-[12.5px] font-medium text-white transition-colors mb-2
                ${action === "release" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {t("escrow.confirm")}
            </button>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg text-[12.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-primary)] transition-colors"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const EscrowPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { transactions, stats, isLoading } = useSelector(
    (state: RootState) => state.escrow,
  );

  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<EscrowTransaction | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "release" | "refund" | null
  >(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchEscrow(statusFilter));
  }, [statusFilter]);

  const handleAction = async () => {
    if (!selectedTransaction || !confirmAction) return;
    setActionLoading(true);
    if (confirmAction === "release") {
      await dispatch(releaseEscrow(selectedTransaction.id));
    } else {
      await dispatch(refundEscrow(selectedTransaction.id));
    }
    setActionLoading(false);
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

  const tableColumns = [
    t("escrow.trackingNumber"),
    t("escrow.customer"),
    t("escrow.driver"),
    t("escrow.amount"),
    t("escrow.status"),
    t("escrow.date"),
    t("escrow.actions"),
  ];

  if (isLoading && !transactions.length) return <EscrowSkeleton />;

  return (
    <>
      <div className="space-y-3" dir={isRTL ? "rtl" : "ltr"}>
        {/* ── Title ─────────────────────────────────────────────── */}
        <div className="flex items-baseline gap-2">
          <h1 className="font-['Syne',sans-serif] text-[18px] font-bold text-[var(--text-primary)]">
            {t("escrow.title")}
          </h1>
          <span className="text-[13px] text-[var(--text-secondary)]">
            — {stats?.pendingCount ?? 0} {t("escrow.pendingCount")}
          </span>
        </div>

        {/* ── Stat cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <StatCard
            label={t("escrow.totalHeld")}
            value={`EGP ${stats?.totalHeld.toLocaleString() ?? 0}`}
            subText={`${stats?.pendingCount ?? 0} ${t("escrow.pendingCount")}`}
            trend="neutral"
            icon={Shield}
          />
          <StatCard
            label={t("escrow.totalReleased")}
            value={`EGP ${stats?.totalReleased.toLocaleString() ?? 0}`}
            subText="↑ 8% vs last week"
            trend="up"
            icon={CheckCircle}
          />
          <StatCard
            label={t("escrow.totalRefunded")}
            value={`EGP ${stats?.totalRefunded.toLocaleString() ?? 0}`}
            subText="to customers"
            trend="neutral"
            icon={RotateCcw}
          />
          <StatCard
            label={t("escrow.pendingCount")}
            value={stats?.pendingCount.toString() ?? "0"}
            subText="awaiting release"
            trend="neutral"
            icon={Clock}
          />
        </div>

        {/* ── Table ─────────────────────────────────────────────── */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px] overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-1">
              {statusKeys.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-md text-[11.5px] transition-colors
                    ${statusFilter === s ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
                >
                  {getStatusLabel(s)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px] min-w-[700px]">
              <thead>
                <tr className="bg-[var(--bg-primary)]">
                  {tableColumns.map((col) => (
                    <th
                      key={col}
                      className={`px-3.5 py-2.5 text-${isRTL ? "right" : "left"} text-[10.5px] font-medium text-[var(--text-muted)] border-b border-[var(--border-color)] uppercase tracking-[0.05em]`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex justify-center">
                        <Spinner size="md" />
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-[13px] text-[var(--text-muted)]"
                    >
                      <i className="ti ti-shield-off text-[28px] block mb-2 mx-auto" />
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-[var(--bg-primary)] transition-colors"
                    >
                      {/* Tracking */}
                      <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                        <span className="text-[12px] font-mono text-blue-500">
                          {transaction.trackingNumber}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[var(--text-primary)]">
                        {transaction.customerName}
                      </td>

                      {/* Driver */}
                      <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                        {transaction.driverName}
                      </td>

                      {/* Amount */}
                      <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                        <span className="text-[12.5px] font-medium text-[var(--text-primary)]">
                          EGP {transaction.amount}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                        <Badge
                          variant={statusBadge[transaction.status] ?? "gray"}
                        >
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </td>

                      {/* Date */}
                      <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[11.5px] text-[var(--text-muted)]">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                        {(transaction.status === "held" ||
                          transaction.status === "disputed") && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setConfirmAction("release");
                              }}
                              className="text-[11.5px] font-medium text-green-600 dark:text-green-400 hover:underline transition"
                            >
                              {t("escrow.release")}
                            </button>
                            <span className="text-[var(--border-color)]">
                              |
                            </span>
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setConfirmAction("refund");
                              }}
                              className="text-[11.5px] font-medium text-blue-500 hover:underline transition"
                            >
                              {t("escrow.refund")}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {selectedTransaction && confirmAction && (
        <ConfirmModal
          transaction={selectedTransaction}
          action={confirmAction}
          onConfirm={handleAction}
          onClose={() => {
            setSelectedTransaction(null);
            setConfirmAction(null);
          }}
          actionLoading={actionLoading}
        />
      )}
    </>
  );
};

export default EscrowPage;
