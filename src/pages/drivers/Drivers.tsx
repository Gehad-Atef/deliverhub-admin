import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Users,
  Wifi,
  Star,
  Truck,
  Eye,
  Ban,
  RefreshCw,
  X,
  Check,
} from "lucide-react";
import {
  fetchDrivers,
  updateDriverStatus,
  setPage,
} from "../../store/slices/driversSlice";
import type { Driver } from "../../types/driver";
import type { AppDispatch, RootState } from "../../store";
import { StatCard } from "../../components/shared/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";

const statusBadge: Record<
  string,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  active: "green",
  inactive: "gray",
  suspended: "red",
  pending: "amber",
  banned: "red",
};

const vehicleIcons: Record<string, string> = {
  motorcycle: "🏍️",
  car: "🚗",
  van: "🚐",
  truck: "🚛",
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-[2px]">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className="text-[13px]"
        style={{
          color: star <= Math.round(rating) ? "#f59e0b" : "var(--border-color)",
        }}
      >
        ★
      </span>
    ))}
  </div>
);

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`bg-[var(--bg-primary)] rounded-lg animate-pulse ${className}`}
  />
);

const DriversSkeleton = () => (
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

// ─── View Driver Modal ────────────────────────────────────────────────────────
const ViewDriverModal: React.FC<{ driver: Driver; onClose: () => void }> = ({
  driver,
  onClose,
}) => {
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
      <div className="w-full sm:max-w-sm sm:mx-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
          <h2 className="font-['Syne',sans-serif] text-[15px] font-semibold text-[var(--text-primary)]">
            {t("drivers.driverDetails")}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-[15px] font-semibold text-blue-500 dark:text-blue-400">
              {driver.name.charAt(0)}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                {driver.name}
              </p>
              <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5">
                {driver.email}
              </p>
            </div>
            <div className="ml-auto">
              <Badge variant={statusBadge[driver.status] ?? "gray"}>
                {t(`drivers.${driver.status}`)}
              </Badge>
            </div>
          </div>

          <div className="border border-[var(--border-color)] rounded-xl overflow-hidden">
            {[
              { label: t("users.phone"), value: driver.phone },
              {
                label: t("drivers.vehicle"),
                value: `${vehicleIcons[driver.vehicle.type] ?? "🚗"} ${driver.vehicle.plateNumber}`,
              },
              { label: t("drivers.deliveries"), value: driver.totalDeliveries },
              { label: t("drivers.rating"), value: driver.rating },
              {
                label: t("users.joined"),
                value: driver.joinedAt
                  ? new Date(driver.joinedAt).toLocaleDateString()
                  : "—",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] last:border-none"
              >
                <span className="text-[11.5px] text-[var(--text-muted)]">
                  {label}
                </span>
                <span className="text-[12.5px] text-[var(--text-primary)]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg text-[12.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.07] dark:hover:bg-white/[0.09] transition-colors"
          >
            {t("users.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DriversPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { drivers, isLoading, total, page, limit } = useSelector(
    (state: RootState) => state.drivers,
  );

  const [localSearch, setLocalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDriver, setViewDriver] = useState<Driver | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(localSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [localSearch]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    dispatch(setPage(1));
  }, [debouncedSearch, dispatch]);

  // Fetch drivers when page, limit, or debouncedSearch changes
  useEffect(() => {
    dispatch(fetchDrivers({ page, limit, search: debouncedSearch }));
  }, [page, limit, debouncedSearch, dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchDrivers({ page: 1, limit, search: localSearch }));
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    let newStatus: "active" | "suspended" | "banned";

    if (currentStatus === "active") {
      newStatus = "suspended";
    } else if (currentStatus === "suspended" || currentStatus === "pending") {
      newStatus = "active";
    } else {
      return; // banned → مفيش action
    }

    setActionLoading(id);
    await dispatch(updateDriverStatus({ id, status: newStatus }));
    setActionLoading(null);
  };

  const statusTabs = [
    { key: "all", label: t("offices.all") },
    { key: "active", label: t("drivers.active") },
    { key: "inactive", label: t("drivers.inactive") },
    { key: "suspended", label: t("drivers.suspended") },
    { key: "pending", label: t("drivers.pending") },
    { key: "banned", label: t("drivers.banned") },
  ];

  const filteredDrivers =
    statusFilter === "all"
      ? drivers
      : drivers.filter((d) => d.status === statusFilter);

  const onlineDrivers = drivers.filter((d) => d.status === "active").length;
  const avgRating = drivers.length
    ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(
        1,
      )
    : "0.0";
  const totalDeliveries = drivers.reduce(
    (sum, d) => sum + d.totalDeliveries,
    0,
  );

  const tableColumns = [
    t("drivers.driver"),
    t("drivers.phone"),
    t("drivers.vehicle"),
    t("drivers.rating"),
    t("drivers.deliveries"),
    t("drivers.completion"),
    t("drivers.status"),
    t("drivers.actions"),
  ];

  if (isLoading && !drivers.length) return <DriversSkeleton />;

  return (
    <>
      <div className="space-y-3" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex items-baseline gap-2">
          <h1 className="font-['Syne',sans-serif] text-[18px] font-bold text-[var(--text-primary)]">
            {t("drivers.title")}
          </h1>
          <span className="text-[13px] text-[var(--text-secondary)]">
            — {total} {t("drivers.totalDrivers")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <StatCard
            label={t("drivers.totalDrivers")}
            value={total.toString()}
            subText={`↑ 5 ${t("drivers.thisMonth")}`}
            trend="up"
            icon={Users}
          />
          <StatCard
            label={t("drivers.onlineNow")}
            value={onlineDrivers.toString()}
            subText={`${total ? Math.round((onlineDrivers / total) * 100) : 0}% ${t("drivers.ofTotal")}`}
            trend="neutral"
            icon={Wifi}
          />
          <StatCard
            label={t("drivers.avgRating")}
            value={avgRating}
            subText={t("drivers.basedOnReviews")}
            trend="neutral"
            icon={Star}
          />
          <StatCard
            label={t("drivers.totalDeliveries")}
            value={totalDeliveries.toString()}
            subText={`↑ 18% ${t("drivers.vsYesterday")}`}
            trend="up"
            icon={Truck}
          />
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px] overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-[var(--border-color)]">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-[6px] w-full sm:w-[220px]"
            >
              <i className="ti ti-search text-[15px] text-[var(--text-muted)] flex-shrink-0" />
              <input
                type="text"
                placeholder={t("drivers.searchPlaceholder")}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-full"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch("")}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <i className="ti ti-x text-[13px]" />
                </button>
              )}
            </form>

            <div className="flex items-center gap-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-1">
              {statusTabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1 rounded-md text-[11.5px] transition-colors
                    ${statusFilter === key ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <span className="text-[11.5px] text-[var(--text-muted)]">
              {filteredDrivers.length}{" "}
              {filteredDrivers.length !== 1
                ? t("offices.results")
                : t("offices.result")}
            </span>
          </div>

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
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex justify-center">
                        <Spinner size="md" />
                      </div>
                    </td>
                  </tr>
                ) : filteredDrivers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-[13px] text-[var(--text-muted)]"
                    >
                      <i className="ti ti-user-off text-[28px] block mb-2 mx-auto" />
                      {t("drivers.noResults")}
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => {
                    const completion = Math.min(
                      Math.round((driver.totalDeliveries / 350) * 100),
                      100,
                    );
                    const isActing = actionLoading === driver.id;
                    return (
                      <tr
                        key={driver.id}
                        className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.025] transition-colors"
                      >
                        {/* Driver */}
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-[6px] flex-shrink-0 flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)] text-[10px] font-medium text-[var(--text-secondary)]">
                              {driver.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[12.5px] text-[var(--text-primary)]">
                                {driver.name}
                              </p>
                              <p className="text-[10.5px] text-[var(--text-muted)]">
                                {driver.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Phone */}
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                          {driver.phone}
                        </td>
                        {/* Vehicle */}
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[14px]">
                              {vehicleIcons[driver.vehicle.type] ?? "🚗"}
                            </span>
                            <span className="text-[12px] text-[var(--text-secondary)]">
                              {driver.vehicle.plateNumber}
                            </span>
                          </div>
                        </td>
                        {/* Rating */}
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                          <StarRating rating={driver.rating} />
                        </td>
                        {/* Deliveries */}
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                          {driver.totalDeliveries}
                        </td>
                        {/* Completion */}
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${completion >= 80 ? "bg-blue-500" : completion >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                                style={{ width: `${completion}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {completion}%
                            </span>
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                          <Badge variant={statusBadge[driver.status] ?? "gray"}>
                            {t(`drivers.${driver.status}`)}
                          </Badge>
                        </td>
                        {/* Actions */}
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                          <div className="flex items-center gap-2">
                            {/* View */}
                            <button
                              onClick={() => setViewDriver(driver)}
                              title={t("users.viewDetails")}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] transition-colors"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Toggle status */}
                            {
                              isActing ? (
                                <Spinner size="sm" />
                              ) : driver.status === "active" ? (
                                // active → زرار إيقاف أحمر
                                <button
                                  onClick={() =>
                                    handleToggle(driver.id, driver.status)
                                  }
                                  title={t("drivers.suspend")}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                  <Ban size={15} />
                                </button>
                              ) : driver.status === "pending" ? (
                                // pending → زرار قبول أخضر
                                <button
                                  onClick={() =>
                                    handleToggle(driver.id, driver.status)
                                  }
                                  title={t("drivers.approve")}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-green-500 hover:bg-green-500/10 transition-colors"
                                >
                                  <Check size={15} />
                                </button>
                              ) : driver.status === "suspended" ? (
                                // suspended → زرار استعادة أخضر
                                <button
                                  onClick={() =>
                                    handleToggle(driver.id, driver.status)
                                  }
                                  title={t("drivers.setActive")}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-green-500 hover:bg-green-500/10 transition-colors"
                                >
                                  <RefreshCw size={15} />
                                </button>
                              ) : null /* banned → مفيش زرار */
                            }
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-color)]">
              <span className="text-[11.5px] text-[var(--text-muted)]">
                {t("users.page")} {page} / {Math.ceil(total / limit)}
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={page <= 1 || isLoading}
                  onClick={() => dispatch(setPage(page - 1))}
                  className="px-3 py-1.5 rounded-lg text-[11.5px] text-[var(--text-secondary)] bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.07] dark:hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {t("users.prev")}
                </button>
                <button
                  disabled={page >= Math.ceil(total / limit) || isLoading}
                  onClick={() => dispatch(setPage(page + 1))}
                  className="px-3 py-1.5 rounded-lg text-[11.5px] text-[var(--text-secondary)] bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.07] dark:hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {t("users.next")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewDriver && (
        <ViewDriverModal
          driver={viewDriver}
          onClose={() => setViewDriver(null)}
        />
      )}
    </>
  );
};

export default DriversPage;
