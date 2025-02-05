interface ApiResponse<T> {
  data: T;
  status: string;
  _links?: {
    self: { href: string };
  };
}

interface ApiError {
  data: null;
  status: string;
  error: {
    message: string;
    details?: string;
  };
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationInfo;
  _links: {
    self: { href: string };
    first?: { href: string };
    prev?: { href: string };
    next?: { href: string };
    last?: { href: string };
  };
}

export const createSuccessResponse = <T>(
  data: T, 
  status: string = 'success',
  links?: { href: string }
): ApiResponse<T> => ({
  data,
  status,
  ...(links && { _links: { self: links } })
});

export const createErrorResponse = (
  message: string,
  details?: string,
  status: string = 'error'
): ApiError => ({
  data: null,
  status,
  error: {
    message,
    ...(details && { details })
  }
});

export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  pageSize: number,
  totalItems: number,
  baseUrl: string
): PaginatedResponse<{ items: T[]; count: number }> => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data: {
      items: data,
      count: data.length
    },
    status: 'success',
    pagination: {
      currentPage: page,
      pageSize,
      totalItems,
      totalPages
    },
    _links: {
      self: { href: `${baseUrl}?page=${page}&pageSize=${pageSize}` },
      first: { href: `${baseUrl}?page=1&pageSize=${pageSize}` },
      ...(hasPrev && { prev: { href: `${baseUrl}?page=${page - 1}&pageSize=${pageSize}` } }),
      ...(hasNext && { next: { href: `${baseUrl}?page=${page + 1}&pageSize=${pageSize}` } }),
      last: { href: `${baseUrl}?page=${totalPages}&pageSize=${pageSize}` }
    }
  };
};
