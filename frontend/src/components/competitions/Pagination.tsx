import "./pagination-module.css";

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
    (_, i) => startPage + i,
  );

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pagination-buttons">
      {/* Jump previous block */}
      {totalPages >= 5 && (
        <button
          disabled={startPage === 1}
          onClick={() => handlePageChange(startPage - 1)}
        >
          <i className="bx bx-chevrons-left"></i>
        </button>
      )}

      {/* Prev page */}
      <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
        <i className="bx bx-chevron-left"></i>
      </button>

      {/* Page numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={p === page ? "active" : ""}
        >
          {p}
        </button>
      ))}

      {/* Next page */}
      <button
        disabled={page === totalPages}
        onClick={() => handlePageChange(page + 1)}
      >
        <i className="bx bx-chevron-right"></i>
      </button>

      {/* Jump next block */}
      {totalPages >= 5 && (
        <button
          disabled={endPage === totalPages}
          onClick={() => handlePageChange(endPage + 1)}
        >
          <i className="bx bx-chevrons-right"></i>
        </button>
      )}
    </div>
  );
}
