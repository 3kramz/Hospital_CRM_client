import React, { useEffect, useState } from "react";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    axiosSecure
      .get("/save-patient-bill/all-reports")
      .then((res) => {
        setReports(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch reports:", err);
        setLoading(false);
      });
  }, [axiosSecure]);

  if (loading) return <p className="text-center mt-10">Loading Reports...</p>;
  if (!reports.length)
    return <p className="text-center mt-10">No reports found</p>;

  const tableTitleCSS =
    "font-medium text-black text-sm tracking-[0.45px] leading-[18.3px] whitespace-nowrap";

  // Filtering
  let filteredReports = reports.filter((rpt) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      String(rpt.patientName || "")
        .toLowerCase()
        .includes(searchLower) ||
      String(rpt.contact || "")
        .toLowerCase()
        .includes(searchLower) ||
      String(rpt.patientId || "")
        .toLowerCase()
        .includes(searchLower) ||
      String(rpt.invoiceId || "")
        .toLowerCase()
        .includes(searchLower);

  const matchesStatus = statusFilter
  ? String(rpt.payment || "").toLowerCase() === statusFilter.toLowerCase()
  : true;

    const matchesPayment = paymentFilter
      ? String(rpt.payment || "").toLowerCase() === paymentFilter.toLowerCase()
      : true;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Sorting
  if (sortField) {
    filteredReports.sort((a, b) => {
      const aField = String(a[sortField] || "").toLowerCase();
      const bField = String(b[sortField] || "").toLowerCase();
      if (aField < bField) return sortOrder === "asc" ? -1 : 1;
      if (aField > bField) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentReports = filteredReports.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Function to highlight search text
  const highlightText = (text) => {
    if (!searchText) return text;
    const regex = new RegExp(`(${searchText})`, "gi");
    const parts = String(text).split(regex);
    return parts.map((part, idx) =>
      regex.test(part) ? (
        <span key={idx} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-[#ffffffd4] min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-2xl font-semibold mb-4">Diagnostic Reports</h1>

      {/* Filter and Search */}
     <div className="flex gap-4 mb-4 items-center">
  <input
    type="text"
    placeholder="Search by Name, Contact, PID, Invoice ID"
    value={searchText}
    onChange={(e) => {
      setSearchText(e.target.value);
      setCurrentPage(1);
    }}
    className="border px-2 py-1 rounded"
  />

  {/* Status as Payment Status */}
  <select
    value={statusFilter}
    onChange={(e) => {
      setStatusFilter(e.target.value);
      setCurrentPage(1);
    }}
    className="border px-2 py-1 rounded"
  >
    <option value="">All Status</option>
    <option value="paid">Paid</option>
    <option value="due">Due</option>
  </select>

  <select
    value={paymentFilter}
    onChange={(e) => {
      setPaymentFilter(e.target.value);
      setCurrentPage(1);
    }}
    className="border px-2 py-1 rounded"
  >
    <option value="">All Payment</option>
    <option value="paid">Paid</option>
    <option value="unpaid">Unpaid</option>
  </select>
</div>
      {/* Table Header */}
      <div className="flex w-full max-w-[1200px] bg-[#b0e6fd] border border-black shadow-md px-2 py-2">
        {[
          { label: "#", field: "serial" },
          { label: "Invoice ID", field: "invoiceId" },
          { label: "Patient ID", field: "patientId" },
          { label: "Name", field: "patientName" },
          { label: "Total Due", field: "totalDue" },
          { label: "Payment", field: "payment" },
          { label: "Status", field: "status" },
          { label: "Action", field: "" },
        ].map(({ label, field }) => (
          <div
            key={label}
            className={`${tableTitleCSS} flex-1 text-center cursor-pointer select-none`}
            onClick={() => field && handleSort(field)}
          >
            {label}{" "}
            {sortField === field ? (sortOrder === "asc" ? "▲" : "▼") : ""}
          </div>
        ))}
      </div>

      {/* Table Rows */}
      <div className="flex flex-col w-full max-w-[1200px]">
        {currentReports.map((rpt, idx) => (
          <div
            key={rpt.id}
            className="flex border-b border-gray-300 px-2 py-2 items-center hover:bg-gray-100"
          >
            <div className="flex-1 text-center">{startIndex + idx + 1}</div>
            <div className="flex-1 text-center">
              {highlightText(rpt.invoiceId)}
            </div>
            <div className="flex-1 text-center">
              {highlightText(rpt.patientId)}
            </div>
            <div className="flex-1 text-left">
              {highlightText(rpt.patientName)}
            </div>
            <div className="flex-1 text-right">{rpt.totalDue?.toFixed(2)}</div>
            <div
              className={`flex-1 text-center font-semibold ${
                String(rpt.payment || "").toLowerCase() === "paid"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {rpt.payment}
            </div>
            <div
              className={`flex-1 text-center font-semibold ${
                String(rpt.status || "").toLowerCase() === "complete"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {rpt.status}
            </div>
            <div className="flex-1 text-center">
              <button className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-4 items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 border rounded ${
              currentPage === page ? "bg-blue-500 text-white" : ""
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <p className="mt-4 text-sm">
        Showing {startIndex + 1} to{" "}
        {Math.min(startIndex + pageSize, filteredReports.length)} of{" "}
        {filteredReports.length} results
      </p>
    </div>
  );
};

export default Reports;
