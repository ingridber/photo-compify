type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pageSize = 5;

  const currentBlock = Math.floor((page - 1) / pageSize);

  const startPage = currentBlock * pageSize + 1;
  const endPage = Math.min(startPage + pageSize - 1, totalPages);

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        marginTop: 40,
        display: "flex",
        justifyContent: "center",
        gap: 10,
        alignItems: "center",
      }}
    >
      {/* Jump previous block */}
      <button
        disabled={startPage === 1}
        onClick={() => onPageChange(startPage - 1)}
      >
        <i className="bx bx-chevrons-left"></i>
      </button>

      {/* Prev page */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <i className="bx bx-chevron-left"></i>
      </button>

      {/* Page numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            fontWeight: p === page ? "bold" : "normal",
            textDecoration: p === page ? "underline" : "none",
          }}
        >
          {p}
        </button>
      ))}

      {/* Next page */}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <i className="bx bx-chevron-right"></i>
      </button>

      {/* Jump next block */}
      <button
        disabled={endPage === totalPages}
        onClick={() => onPageChange(endPage + 1)}
      >
        <i className="bx bx-chevrons-right"></i>
      </button>
    </div>
  );
}