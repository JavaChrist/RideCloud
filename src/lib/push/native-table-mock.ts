export interface NativeTokenMockRow {
  id: string;
  user_id: string;
  platform: "android" | "ios";
  token: string;
  installation_id: string | null;
}

function matches(row: object, filters: Record<string, string>): boolean {
  const record = row as Record<string, unknown>;
  return Object.entries(filters).every(([key, value]) => record[key] === value);
}

function createFilterChain<T extends object>(
  rows: () => T[],
  onResolve?: (filters: Record<string, string>) => { data?: unknown; error: { message: string } | null }
) {
  const filters: Record<string, string> = {};
  const self = {
    eq(column: string, value: string) {
      filters[column] = value;
      return self;
    },
    maybeSingle: async () => {
      const found = rows().find((row) => matches(row, filters)) ?? null;
      return { data: found, error: null };
    },
    then(
      onFulfilled: (value: { data: T[]; error: null }) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) {
      if (onResolve) {
        const result = onResolve(filters);
        return Promise.resolve({ data: result.data ?? [], error: result.error }).then(
          onFulfilled as never,
          onRejected
        );
      }
      return Promise.resolve({
        data: rows().filter((row) => matches(row, filters)),
        error: null
      }).then(onFulfilled, onRejected);
    }
  };
  return self;
}

export function createNativeTokensTable(initial: NativeTokenMockRow[] = []) {
  const rows = [...initial];
  let seq = rows.length;

  return {
    rows,
    from() {
      return {
        select: () => createFilterChain(() => rows),
        insert: async (fields: Omit<NativeTokenMockRow, "id">) => {
          if (rows.some((row) => row.token === fields.token)) {
            return { error: { message: "duplicate token" } };
          }
          seq += 1;
          rows.push({ id: `native-${seq}`, ...fields });
          return { error: null };
        },
        update: (fields: Partial<NativeTokenMockRow>) =>
          createFilterChain(() => rows, (filters) => {
            for (let index = 0; index < rows.length; index += 1) {
              if (matches(rows[index], filters)) {
                rows[index] = { ...rows[index], ...fields, id: rows[index].id };
              }
            }
            return { error: null };
          }),
        delete: () =>
          createFilterChain(() => rows, (filters) => {
            const remaining = rows.filter((row) => !matches(row, filters));
            rows.splice(0, rows.length, ...remaining);
            return { error: null };
          })
      };
    }
  };
}
