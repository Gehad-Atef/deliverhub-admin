import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Users, Wifi, Star, Truck } from "lucide-react";
import {
  fetchDrivers,
  updateDriverStatus,
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
      <i
        key={star}
        className="ti ti-star-filled text-[12px]"
        style={{
          color:
            star <= Math.round(rating)
              ? "var(--amber, #f59e0b)"
              : "var(--border-color)",
        }}
      />
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

const ManageDriverModal: React.FC<{
  driver: Driver;
  onAction: (id: string, status: "active" | "inactive" | "suspended") => void;
  onClose: () => void;
  actionLoading: boolean;
}> = ({ driver, onAction, onClose, actionLoading }) => {
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
            {t("drivers.manageDriver")}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
          >
            <i className="ti ti-x text-[16px]" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-[14px] font-semibold text-blue-400">
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

          <div className="flex flex-col gap-2">
            {actionLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="md" />
              </div>
            ) : (
              <>
                <button
                  onClick={() => onAction(driver.id, "active")}
                  disabled={driver.status === "active"}
                  className="w-full py-2.5 rounded-lg text-[12.5px] font-medium border border-green-500/25 text-green-600 dark:text-green-400 hover:bg-green-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {t("drivers.setActive")}
                </button>
                <button
                  onClick={() => onAction(driver.id, "inactive")}
                  disabled={driver.status === "inactive"}
                  className="w-full py-2.5 rounded-lg text-[12.5px] font-medium border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {t("drivers.setInactive")}
                </button>
                <button
                  onClick={() => onAction(driver.id, "suspended")}
                  disabled={driver.status === "suspended"}
                  className="w-full py-2.5 rounded-lg text-[12.5px] font-medium border border-red-500/25 text-red-600 dark:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {t("drivers.suspend")}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg text-[12.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-primary)] hover:bg-[var(--bg-primary)] transition-colors"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

const DriversPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { drivers, isLoading, total, page, limit } = useSelector(
    (state: RootState) => state.drivers,
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchDrivers({ page, limit, search }));
  }, [page, limit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchDrivers({ page: 1, limit, search }));
  };

  const handleStatusChange = async (
    id: string,
    status: "active" | "inactive" | "suspended",
  ) => {
    setActionLoading(true);
    await dispatch(updateDriverStatus({ id, status }));
    setActionLoading(false);
    setSelectedDriver(null);
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-full"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
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
                    return (
                      <tr
                        key={driver.id}
                        className="hover:bg-[var(--bg-primary)] transition-colors"
                      >
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
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                          {driver.phone}
                        </td>
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
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                          <StarRating rating={driver.rating} />
                        </td>
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                          {driver.totalDeliveries}
                        </td>
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
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                          <Badge variant={statusBadge[driver.status] ?? "gray"}>
                            {t(`drivers.${driver.status}`)}
                          </Badge>
                        </td>
                        <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                          <button
                            onClick={() => setSelectedDriver(driver)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                            title={t("common.manage")}
                          >
                            <i className="ti ti-settings text-[15px]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedDriver && (
        <ManageDriverModal
          driver={selectedDriver}
          onAction={handleStatusChange}
          onClose={() => setSelectedDriver(null)}
          actionLoading={actionLoading}
        />
      )}
    </>
  );
};

export default DriversPage;
