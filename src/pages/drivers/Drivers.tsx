import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchDrivers,
  updateDriverStatus,
} from "../../store/slices/driversSlice";
import type { Driver } from "../../types/user";
import type { AppDispatch, RootState } from "../../store";

const statusStyles = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  suspended: "bg-red-100 text-red-600",
};

const vehicleIcons = {
  motorcycle: "🏍️",
  car: "🚗",
  van: "🚐",
  truck: "🚛",
};

const DriversPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { drivers, isLoading, total, page, limit } = useSelector(
    (state: RootState) => state.drivers,
  );

  const [search, setSearch] = useState("");
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total drivers</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 transition"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">
                  Driver
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">
                  Phone
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">
                  Vehicle
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">
                  Rating
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">
                  Deliveries
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr
                  key={driver.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition"
                >
                  {/* Driver Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center
                        text-blue-700 font-semibold text-sm"
                      >
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {driver.name}
                        </p>
                        <p className="text-xs text-gray-400">{driver.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {driver.phone}
                  </td>

                  {/* Vehicle */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span>{vehicleIcons[driver.vehicle.type]}</span>
                      <span className="text-sm text-gray-600">
                        {driver.vehicle.plateNumber}
                      </span>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-sm font-medium text-gray-700">
                        {driver.rating}
                      </span>
                    </div>
                  </td>

                  {/* Deliveries */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {driver.totalDeliveries}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                      ${statusStyles[driver.status]}`}
                    >
                      {driver.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedDriver(driver)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                    >
                      Manage
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
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() =>
                dispatch({ type: "drivers/setPage", payload: page - 1 })
              }
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40
                hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() =>
                dispatch({ type: "drivers/setPage", payload: page + 1 })
              }
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40
                hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Manage Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Manage Driver
            </h3>
            <p className="text-sm text-gray-500 mb-6">{selectedDriver.name}</p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleStatusChange(selectedDriver.id, "active")}
                disabled={selectedDriver.status === "active"}
                className="w-full py-2.5 rounded-lg text-sm font-medium border border-green-200
                  text-green-700 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Set Active
              </button>
              <button
                onClick={() =>
                  handleStatusChange(selectedDriver.id, "inactive")
                }
                disabled={selectedDriver.status === "inactive"}
                className="w-full py-2.5 rounded-lg text-sm font-medium border border-gray-200
                  text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Set Inactive
              </button>
              <button
                onClick={() =>
                  handleStatusChange(selectedDriver.id, "suspended")
                }
                disabled={selectedDriver.status === "suspended"}
                className="w-full py-2.5 rounded-lg text-sm font-medium border border-red-200
                  text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Suspend
              </button>
            </div>

            <button
              onClick={() => setSelectedDriver(null)}
              className="mt-4 w-full py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversPage;
