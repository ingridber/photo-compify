export type PaginationResult = {
    page: number;
    limit: number;
    skip: number;
};

export const getPagination = (query: any): PaginationResult => {
    // Convert page from query to a number, default to 1, and ensure it is never below 1
    const page = Math.max(Number(query.page) || 1, 1);

    // Convert limit from query to a number, default to 6,
    // ensure it is at least 1 and at most 100 (to prevent overload)
    const limit = Math.min(Math.max(Number(query.limit) || 6, 1), 100);

    // Calculate how many documents to skip based on current page and limit
    const skip = (page - 1) * limit;

    return { page, limit, skip };
    
};