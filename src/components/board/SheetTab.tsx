import React, { useState, useCallback } from 'react';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CellData {
  [key: string]: string;
}

interface SheetTabProps {
  tabId: string;
  initialRows?: CellData[];
  onSave?: (rows: CellData[]) => void;
}

const DEFAULT_COLUMNS = ['A', 'B', 'C', 'D', 'E'];
const DEFAULT_ROW_COUNT = 10;

export function SheetTab({ tabId, initialRows = [], onSave }: SheetTabProps) {
  const [columns, setColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [rows, setRows] = useState<CellData[]>(() => {
    if (initialRows.length > 0) return initialRows;
    // Initialize empty rows
    return Array.from({ length: DEFAULT_ROW_COUNT }, () =>
      columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {} as CellData)
    );
  });

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null);

  const updateCell = useCallback((rowIndex: number, colKey: string, value: string) => {
    setRows(prev => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [colKey]: value };
      onSave?.(updated);
      return updated;
    });
  }, [onSave]);

  const addRow = () => {
    const newRow = columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {} as CellData);
    const updated = [...rows, newRow];
    setRows(updated);
    onSave?.(updated);
  };

  const addColumn = () => {
    const newColLetter = String.fromCharCode(65 + columns.length); // A=65, B=66, etc.
    setColumns(prev => [...prev, newColLetter]);
    setRows(prev => prev.map(row => ({ ...row, [newColLetter]: '' })));
  };

  const generateFormula = () => {
    alert('AI Formula generation coming in Phase 3');
  };

  return (
    <div className="h-full flex flex-col bg-paper">
      {/* Toolbar */}
      <div className="border-b border-border bg-paper-elevated px-4 py-3 flex gap-2">
        <Button variant="outline" size="sm" onClick={addRow} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Row
        </Button>
        <Button variant="outline" size="sm" onClick={addColumn} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Column
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={generateFormula}
          className="gap-2 bg-spark hover:bg-spark/90 text-accent-foreground"
        >
          <Sparkles className="h-4 w-4" />
          AI Formula
        </Button>
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm font-mono">
          <thead className="sticky top-0 z-10">
            <tr className="bg-secondary">
              {/* Row number header */}
              <th className="w-12 border border-border bg-secondary text-center text-xs font-medium text-muted-foreground p-2">
                #
              </th>
              {columns.map(col => (
                <th
                  key={col}
                  className="min-w-[100px] border border-border bg-secondary text-center text-xs font-medium text-muted-foreground p-2"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-secondary/30">
                {/* Row number */}
                <td className="border border-border bg-secondary/50 text-center text-xs text-muted-foreground p-2">
                  {rowIndex + 1}
                </td>
                {columns.map(col => {
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === col;
                  return (
                    <td
                      key={col}
                      className={`border border-border p-0 ${
                        isSelected ? 'ring-2 ring-spark ring-inset' : ''
                      }`}
                      onClick={() => setSelectedCell({ row: rowIndex, col })}
                    >
                      <Input
                        value={row[col] || ''}
                        onChange={(e) => updateCell(rowIndex, col, e.target.value)}
                        className="h-8 w-full border-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-xs"
                        onFocus={() => setSelectedCell({ row: rowIndex, col })}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
