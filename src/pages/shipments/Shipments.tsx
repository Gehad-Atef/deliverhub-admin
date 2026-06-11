import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  fetchShipments,
  updateShipmentStatus,
} from "../../store/slices/shipmentsSlice";
import type { Shipment } from "../../types/shipment";
import type { AppDispatch, RootState } from "../../store";

const statusStyles: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  assigned: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  picked_up:
    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  in_transit:
    "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  delivered:
    "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  cancelled: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
};

const statusKeys = [
  "all",
  "pending",
  "assigned",
  "picked_up",
  "in_transit",
  "delivered",
  "cancelled",
];

const ShipmentsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { shipments, isLoading, total, page, limit } = useSelector(
    (state: RootState) => state.shipments,
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null,
  );
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    dispatch(fetchShipments({ page, limit, search, status: statusFilter }));
  }, [page, limit, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchShipments({ page: 1, limit, search, status: statusFilter }));
  };

  const handleUpdateStatus = () => {
    if (!selectedShipment || !newStatus) return;
    dispatch(
      updateShipmentStatus({ id: selectedShipment.id, status: newStatus }),
    );
    setSelectedShipment(null);
    setNewStatus("");
  };

  const totalPages = Math.ceil(total / limit);

  // Stats
  const deliveredCount = shipments.filter(
    (s) => s.status === "delivered",
  ).length;
  const inTransitCount = shipments.filter(
    (s) => s.status === "in_transit",
  ).length;
  const pendingCount = shipments.filter((s) => s.status === "pending").length;
  const totalRevenue = shipments.reduce((sum, s) => sum + s.price, 0);

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      all: t("shipments.all"),
      pending: t("shipments.pending"),
      assigned: t("shipments.assigned"),
      picked_up: t("shipments.pickedUp"),
      in_transit: t("shipments.inTransit"),
      delivered: t("shipments.delivered"),
      cancelled: t("shipments.cancelled"),
    };
    return map[status] ?? status;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t("shipments.title")}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {total} {t("shipments.totalShipments")}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
          <p className="text-xs text-[var(--text-secondary)] mb-1">
            {t("shipments.totalShipments")}
          </p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {total}
          </p>
          <p className="text-xs text-green-600 mt-1">↑ 12% this month</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
          <p className="text-xs text-[var(--text-secondary)] mb-1">
            {t("shipments.delivered")}
          </p>
          <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {total ? Math.round((deliveredCount / total) * 100) : 0}% success
            rate
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
          <p className="text-xs text-[var(--text-secondary)] mb-1">
            {t("shipments.inTransit")}
          </p>
          <p className="text-2xl font-bold text-orange-500">{inTransitCount}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {pendingCount} {t("shipments.pending")}
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
          <p className="text-xs text-[var(--text-secondary)] mb-1">
            {t("shipments.totalRevenue")}
          </p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            EGP {totalRevenue}
          </p>
          <p className="text-xs text-green-600 mt-1">↑ 8% vs yesterday</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-60">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("shipments.searchPlaceholder")}
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
        <div className="flex gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-1 flex-wrap">
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
                  {t("shipments.trackingNumber")}
                </th>
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("shipments.customer")}
                </th>
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("shipments.driver")}
                </th>
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("shipments.route")}
                </th>
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("shipments.price")}
                </th>
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("shipments.status")}
                </th>
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("shipments.date")}
                </th>
                <th className="text-left text-xs font-semibold text-[var(--text-secondary)] px-6 py-3">
                  {t("shipments.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr
                  key={shipment.id}
                  className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition"
                >
                  {/* Tracking Number */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-medium text-blue-600">
                      {shipment.trackingNumber}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {shipment.customer.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {shipment.customer.phone}
                    </p>
                  </td>

                  {/* Driver */}
                  <td className="px-6 py-4">
                    {shipment.driver ? (
                      <>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {shipment.driver.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {shipment.driver.phone}
                        </p>
                      </>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)] italic">
                        {t("shipments.unassigned")}
                      </span>
                    )}
                  </td>

                  {/* Route */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      <span>{shipment.pickup.city}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                      <span>{shipment.delivery.city}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      EGP {shipment.price}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {t("shipments.commission")}: EGP {shipment.commission}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium
                      ${statusStyles[shipment.status]}`}
                    >
                      {getStatusLabel(shipment.status)}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                    {new Date(shipment.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedShipment(shipment);
                        setNewStatus(shipment.status);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                    >
                      {t("common.manage")}
                    </button>
                  </td>
                </tr>
              ))}
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
                dispatch({ type: "shipments/setPage", payload: page - 1 })
              }
              className="px-3 py-1.5 text-sm border border-[var(--border-color)] rounded-lg
                disabled:opacity-40 hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] transition"
            >
              {t("common.previous")}
            </button>
            <button
              disabled={page === totalPages}
              onClick={() =>
                dispatch({ type: "shipments/setPage", payload: page + 1 })
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
      {selectedShipment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              {t("shipments.manageShipment")}
            </h3>
            <p className="text-sm font-mono text-blue-600 mb-6">
              {selectedShipment.trackingNumber}
            </p>

            <div className="flex flex-col gap-2 mb-4">
              {statusKeys
                .filter((s) => s !== "all")
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium border transition
                    ${
                      newStatus === s
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600"
                        : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]"
                    }`}
                  >
                    {getStatusLabel(s)}
                  </button>
                ))}
            </div>

            <button
              onClick={handleUpdateStatus}
              disabled={newStatus === selectedShipment.status}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40
                disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition"
            >
              {t("shipments.updateStatus")}
            </button>

            <button
              onClick={() => setSelectedShipment(null)}
              className="mt-2 w-full py-2.5 rounded-lg text-sm text-[var(--text-muted)]
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

export default ShipmentsPage;
