import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchRevenue, setPeriod } from "../../store/slices/revenueSlice";
import type { AppDispatch, RootState } from "../../store";

const periods = ["today", "week", "month", "year"] as const;

const RevenuePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { records, stats, isLoading, period } = useSelector(
    (state: RootState) => state.revenue,
  );

  useEffect(() => {
    dispatch(fetchRevenue(period));
  }, [period]);

  const handlePeriodChange = (p: typeof period) => {
    dispatch(setPeriod(p));
  };

  const maxRevenue = stats?.revenueByDay
    ? Math.max(...stats.revenueByDay.map((d) => d.revenue))
    : 1;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t("revenue.title")}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {t("revenue.revenueBreakdown")}
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition
                ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]"
                }`}
            >
              {t(`revenue.${p}`)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
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
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
              <p className="text-xs text-[var(--text-secondary)] mb-1">
                {t("revenue.totalRevenue")}
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                EGP {stats?.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">
                ↑ 12% vs last period
              </p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
              <p className="text-xs text-[var(--text-secondary)] mb-1">
                {t("revenue.totalCommission")}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                EGP {stats?.totalCommission.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {stats && stats.totalRevenue
                  ? Math.round(
                      (stats.totalCommission / stats.totalRevenue) * 100,
                    )
                  : 0}
                % of revenue
              </p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
              <p className="text-xs text-[var(--text-secondary)] mb-1">
                {t("revenue.totalShipments")}
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats?.totalShipments}
              </p>
              <p className="text-xs text-green-600 mt-1">↑ 8% vs last period</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
              <p className="text-xs text-[var(--text-secondary)] mb-1">
                {t("revenue.avgOrderValue")}
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                EGP {stats?.avgOrderValue}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                per shipment
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-6">
              {t("revenue.revenueBreakdown")}
            </h2>

            {stats?.revenueByDay && stats.revenueByDay.length > 0 ? (
              <div className="flex items-end gap-3 h-40">
                {stats.revenueByDay.map((day) => {
                  const revenueHeight = Math.round(
                    (day.revenue / maxRevenue) * 100,
                  );
                  const commissionHeight = Math.round(
                    (day.commission / maxRevenue) * 100,
                  );
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div className="w-full flex items-end gap-0.5 h-32">
                        {/* Revenue Bar */}
                        <div className="flex-1 flex flex-col justify-end group relative">
                          <div
                            className="w-full bg-blue-500 rounded-t-md transition-all duration-500
                              hover:bg-blue-600 cursor-pointer"
                            style={{
                              height: `${(day.revenue / maxRevenue) * 128}px`,
                            }}
                          />
                          <div
                            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white
                            text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap"
                          >
                            EGP {day.revenue}
                          </div>
                        </div>
                        {/* Commission Bar */}
                        <div className="flex-1 flex flex-col justify-end group relative">
                          <div
                            className="w-full bg-green-400 rounded-t-md transition-all duration-500
                              hover:bg-green-500 cursor-pointer"
                            style={{
                              height: `${(day.commission / maxRevenue) * 128}px`,
                            }}
                          />
                          <div
                            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white
                            text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap"
                          >
                            EGP {day.commission}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(day.date).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] text-center py-10">
                No data available
              </p>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <span className="text-xs text-[var(--text-secondary)]">
                  {t("revenue.totalRevenue")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-400" />
                <span className="text-xs text-[var(--text-secondary)]">
                  {t("revenue.totalCommission")}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-color)]">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {t("revenue.transactionHistory")}
              </h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                  <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                    {t("revenue.trackingNumber")}
                  </th>
                  <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                    {t("revenue.customer")}
                  </th>
                  <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                    {t("revenue.driver")}
                  </th>
                  <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                    {t("revenue.amount")}
                  </th>
                  <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                    {t("revenue.commission")}
                  </th>
                  <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                    {t("revenue.date")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-blue-600">
                        {record.trackingNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                      {record.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {record.driverName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        EGP {record.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-green-600">
                        EGP {record.commission}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenuePage;
