import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function Table<T>({ 
  columns, 
  data, 
  keyField,
  isLoading = false,
  emptyMessage = 'No data available'
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full animate-pulse space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-left text-sm">
        {/* HEADER: Diberi background agar kontras dengan isi tabel */}
        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        
        {/* BODY: Diberi garis pemisah (divide-y) dan warna teks yang jelas */}
        <tbody className="divide-y divide-border">
          {data.map((item, index) => (
            <tr 
              key={String(item[keyField])} 
              className={`
                transition-colors hover:bg-muted/30
                ${index % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'} 
              `}
            >
              {columns.map((col) => (
                <td key={`${String(item[keyField])}-${col.key}`} className="px-4 py-3 text-foreground align-middle">
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}