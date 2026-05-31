export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function paginateResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * A highly reusable generic function to handle Prisma querying, sorting, and pagination across any model.
 */
export async function paginate(
  model: any,
  query: any,
  searchFields: string[] = [],
  extraWhere: Record<string, any> = {},
) {
  const {
    page = 1,
    limit = 10,
    search,
    sortOrder = 'desc',
    sortBy = 'createdAt',
  } = query;
  const skip = (page - 1) * limit;

  // Dynamically build the OR search query based on the fields provided
  let where: any = { ...extraWhere };
  if (search && searchFields.length > 0) {
    where = {
      ...where,
      OR: searchFields.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })),
    };
  }

  // Execute queries in parallel for maximum performance
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    model.count({ where }),
  ]);

  return paginateResponse(data, total, page, limit);
}
