import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
    fetchDrivers,
    updateDriverStatus,
} from "../../store/slices/driversSlice";
import type { Driver } from "../../types/driver";
import type { AppDispatch, RootState } from "../../store";

const statusStyles = {
    active: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    suspended: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
};

const vehicleIcons = {
    motorcycle: "🏍️",
    car: "🚗",
    van: "🚐",
    truck: "🚛",
};

const DriversPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { drivers, isLoading, total, page, limit } = useSelector(
        (state: RootState) => state.drivers,
    );

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

    useEffect(() => {
        dispatch(fetchDrivers({ page, limit, search }));
    }, [page, limit]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(fetchDrivers({ page: 1, limit, search }));
    };

    const handleStatusChange = (
        id: string,
        status: "active" | "inactive" | "suspended",
    ) => {
        dispatch(updateDriverStatus({ id, status }));
        setSelectedDriver(null);
    };

    const statusFilters = [
        { key: "All", label: t("drivers.allStatus") },
        { key: "active", label: t("drivers.active") },
        { key: "inactive", label: t("drivers.inactive") },
        { key: "suspended", label: t("drivers.suspended") },
    ];

    const filteredDrivers =
        statusFilter === "All"
            ? drivers
            : drivers.filter((d) => d.status === statusFilter);

    const totalPages = Math.ceil(total / limit);

    const totalDrivers = total;
    const onlineDrivers = drivers.filter((d) => d.status === "active").length;
    const avgRating = drivers.length
        ? (
              drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length
          ).toFixed(1)
        : "0.0";
    const totalDeliveriesToday = drivers.reduce(
        (sum, d) => sum + d.totalDeliveries,
        0,
    );

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        {t("drivers.title")}
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                        {total} {t("drivers.totalDrivers")}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">
                        {t("drivers.totalDrivers")}
                    </p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {totalDrivers}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                        {t("drivers.thisMonth")}
                    </p>
                </div>
                <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">
                        {t("drivers.onlineNow")}
                    </p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {onlineDrivers}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        {totalDrivers
                            ? Math.round((onlineDrivers / totalDrivers) * 100)
                            : 0}
                        % {t("drivers.ofTotal")}
                    </p>
                </div>
                <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">
                        {t("drivers.avgRating")}
                    </p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {avgRating}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        {t("drivers.basedOnReviews")}
                    </p>
                </div>
                <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">
                        {t("drivers.totalDeliveries")}
                    </p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {totalDeliveriesToday}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                        {t("drivers.vsYesterday")}
                    </p>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="mb-6 flex gap-2">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("drivers.searchPlaceholder")}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--border-color)] 
              bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm outline-none 
              focus:border-blue-500 transition placeholder:text-[var(--text-muted)]"
                    />
                    <button
                        type="submit"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                    >
                        {t("common.search")}
                    </button>
                </form>

                {/* Status Filter */}
                <div className="flex gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-1">
                    {statusFilters.map((s) => (
                        <button
                            key={s.key}
                            onClick={() => setStatusFilter(s.key)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition
                ${
                    statusFilter === s.key
                        ? "bg-blue-600 text-white"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]"
                }`}
                        >
                            {s.label}
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
                                    {t("drivers.driver")}
                                </th>
                                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                                    {t("drivers.phone")}
                                </th>
                                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                                    {t("drivers.vehicle")}
                                </th>
                                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                                    {t("drivers.rating")}
                                </th>
                                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                                    {t("drivers.deliveries")}
                                </th>
                                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                                    {t("drivers.completion")}
                                </th>
                                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                                    {t("drivers.status")}
                                </th>
                                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                                    {t("drivers.actions")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDrivers.map((driver) => {
                                const completion = Math.min(
                                    Math.round(
                                        (driver.totalDeliveries / 350) * 100,
                                    ),
                                    100,
                                );
                                return (
                                    <tr
                                        key={driver.id}
                                        className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition"
                                    >
                                        {/* Driver Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 
                          flex items-center justify-center text-blue-700 dark:text-blue-400 
                          font-semibold text-sm"
                                                >
                                                    {driver.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[var(--text-primary)]">
                                                        {driver.name}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-muted)]">
                                                        {driver.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Phone */}
                                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                            {driver.phone}
                                        </td>

                                        {/* Vehicle */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span>
                                                    {
                                                        vehicleIcons[
                                                            driver.vehicle.type
                                                        ]
                                                    }
                                                </span>
                                                <span className="text-sm text-[var(--text-secondary)]">
                                                    {driver.vehicle.plateNumber}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Rating */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        className={`text-sm ${
                                                            star <=
                                                            Math.round(
                                                                driver.rating,
                                                            )
                                                                ? "text-yellow-400"
                                                                : "text-[var(--border-color)]"
                                                        }`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                                <span className="text-xs text-[var(--text-muted)] ms-1">
                                                    {driver.rating}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Deliveries */}
                                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                            {driver.totalDeliveries}
                                        </td>

                                        {/* Completion */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${
                                                            completion >= 80
                                                                ? "bg-blue-500"
                                                                : completion >=
                                                                    60
                                                                  ? "bg-yellow-400"
                                                                  : "bg-red-400"
                                                        }`}
                                                        style={{
                                                            width: `${completion}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-[var(--text-muted)]">
                                                    {completion}%
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${statusStyles[driver.status]}`}
                                            >
                                                {t(`drivers.${driver.status}`)}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() =>
                                                    setSelectedDriver(driver)
                                                }
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                                            >
                                                {t("common.manage")}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-[var(--text-secondary)]">
                        {t("common.page")} {page} {t("common.of")} {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() =>
                                dispatch({
                                    type: "drivers/setPage",
                                    payload: page - 1,
                                })
                            }
                            className="px-3 py-1.5 text-sm border border-[var(--border-color)] rounded-lg 
                disabled:opacity-40 hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition"
                        >
                            {t("common.previous")}
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() =>
                                dispatch({
                                    type: "drivers/setPage",
                                    payload: page + 1,
                                })
                            }
                            className="px-3 py-1.5 text-sm border border-[var(--border-color)] rounded-lg 
                disabled:opacity-40 hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition"
                        >
                            {t("common.next")}
                        </button>
                    </div>
                </div>
            )}

            {/* Manage Modal */}
            {selectedDriver && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                            {t("drivers.manageDriver")}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">
                            {selectedDriver.name}
                        </p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() =>
                                    handleStatusChange(
                                        selectedDriver.id,
                                        "active",
                                    )
                                }
                                disabled={selectedDriver.status === "active"}
                                className="w-full py-2.5 rounded-lg text-sm font-medium border border-green-200
                  text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 
                  disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                {t("drivers.setActive")}
                            </button>
                            <button
                                onClick={() =>
                                    handleStatusChange(
                                        selectedDriver.id,
                                        "inactive",
                                    )
                                }
                                disabled={selectedDriver.status === "inactive"}
                                className="w-full py-2.5 rounded-lg text-sm font-medium border 
                  border-[var(--border-color)] text-[var(--text-secondary)] 
                  hover:bg-[var(--bg-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                {t("drivers.setInactive")}
                            </button>
                            <button
                                onClick={() =>
                                    handleStatusChange(
                                        selectedDriver.id,
                                        "suspended",
                                    )
                                }
                                disabled={selectedDriver.status === "suspended"}
                                className="w-full py-2.5 rounded-lg text-sm font-medium border border-red-200
                  text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 
                  disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                {t("drivers.suspend")}
                            </button>
                        </div>
                        <button
                            onClick={() => setSelectedDriver(null)}
                            className="mt-4 w-full py-2.5 rounded-lg text-sm text-[var(--text-muted)] 
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

export default DriversPage;
