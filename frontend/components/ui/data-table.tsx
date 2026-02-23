import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function DataTable<T>({
  columns,
  data,
}: {
  columns: { key: keyof T; header: string; render?: (value: unknown, row: T) => React.ReactNode }[];
  data: T[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((c) => (
            <TableHead key={String(c.key)}>{c.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={i}>
            {columns.map((c) => {
              const v = row[c.key as keyof T] as unknown;
              return <TableCell key={String(c.key)}>{c.render ? c.render(v, row) : String(v ?? '')}</TableCell>;
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
