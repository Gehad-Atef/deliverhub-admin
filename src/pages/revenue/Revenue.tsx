import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { DollarSign, TrendingUp, Package, BarChart2 } from "lucide-react";
import { fetchRevenue, setPeriod } from "../../store/slices/revenueSlice";
import type { AppDispatch, RootState } from "../../store";
import { StatCard } from "../../components/shared/StatCard";
import { Spinner } from "../../components/ui/Spinner";

const periods = ["today", "week", "month", "year"] as const;

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-[var(--bg-primary)] rounded-lg animate-pulse ${className}`} />
);

const RevenueSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-7 w-44" />
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
      {[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-[100px]" />))}
    </div>
    <Skeleton className="h-[240px]" />
    <Skeleton className="h-[300px]" />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const RevenuePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { records, stats, isLoading, period } = useSelector(
    (state: RootState) => state.revenue,
  );

  useEffect(() => {
    dispatch(fetchRevenue(period));
  }, [period]);

  const maxRevenue = stats?.revenueByDay
    ? Math.max(...stats.revenueByDay.map((d) => d.revenue), 1)
    : 1;

  const tableColumns = [
    t("revenue.trackingNumber"),
    t("revenue.customer"),
    t("revenue.driver"),
    t("revenue.amount"),
    t("revenue.commission"),
    t("revenue.date"),
  ];

  if (isLoading && !stats) return <RevenueSkeleton />;

  return (
    <div className="space-y-3" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Title + Period Filter ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h1 className="font-['Syne',sans-serif] text-[18px] font-bold text-[var(--text-primary)]">
            {t("revenue.title")}
          </h1>
          <span className="text-[13px] text-[var(--text-secondary)]">
            {t("revenue.revenueBreakdown")}
          </span>
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => dispatch(setPeriod(p))}
              className={`px-3 py-1 rounded-md text-[11.5px] transition-colors
                ${period === p
                  ? "bg-blue-600 text-white"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
            >
              {t(`revenue.${p}`)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* ── Stat cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <StatCard
              label={t("revenue.totalRevenue")}
              value={`EGP ${stats?.totalRevenue.toLocaleString() ?? 0}`}
              subText="↑ 12% vs last period"
              trend="up"
              icon={DollarSign}
            />
            <StatCard
              label={t("revenue.totalCommission")}
              value={`EGP ${stats?.totalCommission.toLocaleString() ?? 0}`}
              subText={`${stats && stats.totalRevenue ? Math.round((stats.totalCommission / stats.totalRevenue) * 100) : 0}% of revenue`}
              trend="up"
              icon={TrendingUp}
            />
            <StatCard
              label={t("revenue.totalShipments")}
              value={stats?.totalShipments.toString() ?? "0"}
              subText="↑ 8% vs last period"
              trend="up"
              icon={Package}
            />
            <StatCard
              label={t("revenue.avgOrderValue")}
              value={`EGP ${stats?.avgOrderValue ?? 0}`}
              subText="per shipment"
              trend="neutral"
              icon={BarChart2}
            />
          </div>

          {/* ── Chart ───────────────────────────────────────────── */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px] p-5">
            <h2 className="text-[13px] font-semibold text-[var(--text-primary)] mb-5">
              {t("revenue.revenueBreakdown")}
            </h2>

            {stats?.revenueByDay && stats.revenueByDay.length > 0 ? (
              <div className="flex items-end gap-3 h-40">
                {stats.revenueByDay.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end gap-0.5 h-32">
                      {/* Revenue Bar */}
                      <div className="flex-1 flex flex-col justify-end group relative">
                        <div
                          className="w-full bg-blue-500 rounded-t-md transition-all duration-500 hover:bg-blue-400 cursor-pointer"
                          style={{ height: `${(day.revenue / maxRevenue) * 128}px` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-[10.5px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                          EGP {day.revenue}
                        </div>
                      </div>
                      {/* Commission Bar */}
                      <div className="flex-1 flex flex-col justify-end group relative">
                        <div
                          className="w-full bg-green-500 rounded-t-md transition-all duration-500 hover:bg-green-400 cursor-pointer"
                          style={{ height: `${(day.commission / maxRevenue) * 128}px` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-[10.5px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                          EGP {day.commission}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10.5px] text-[var(--text-muted)]">
                      {new Date(day.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)]">
                <i className="ti ti-chart-bar-off text-[28px] mb-2" />
                <p className="text-[13px]">No data available</p>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <span className="text-[11.5px] text-[var(--text-secondary)]">{t("revenue.totalRevenue")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className="text-[11.5px] text-[var(--text-secondary)]">{t("revenue.totalCommission")}</span>
              </div>
            </div>
          </div>

          {/* ── Transaction History ──────────────────────────────── */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-color)]">
              <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">
                {t("revenue.transactionHistory")}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px] min-w-[600px]">
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
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[13px] text-[var(--text-muted)]">
                        <i className="ti ti-receipt-off text-[28px] block mb-2 mx-auto" />
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id} className="hover:bg-[var(--bg-primary)] transition-colors">
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                          <span className="text-[12px] font-mono text-blue-500">{record.trackingNumber}</span>
                        </td>
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[var(--text-primary)]">
                          {record.customerName}
                        </td>
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                          {record.driverName}
                        </td>
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                          <span className="text-[12.5px] font-medium text-[var(--text-primary)]">EGP {record.amount}</span>
                        </td>
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                          <span className="text-[12.5px] font-medium text-green-600 dark:text-green-400">EGP {record.commission}</span>
                        </td>
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[11.5px] text-[var(--text-muted)]">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenuePage;