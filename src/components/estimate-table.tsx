'use client';

import { useMemo, useState, useTransition } from 'react';

type Item = {
  id: string;
  line_index: number;
  postnr: string;
  code: string;
  title: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number | null;
  comment: string | null;
  line_total: number;
};

type Props = {
  estimateId: string;
  currency: string;
  initialItems: Item[];
};

export function EstimateTable({ estimateId, currency, initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  const updateItem = (itemId: string, patch: Partial<Item>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const next = { ...item, ...patch };
        const unitPrice = Number(next.unit_price ?? 0);
        return { ...next, line_total: unitPrice * Number(next.quantity ?? 0) };
      })
    );

    startTransition(async () => {
      await fetch(`/api/estimate-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
    });
  };

  const total = useMemo(() => items.reduce((sum, item) => sum + (item.line_total || 0), 0), [items]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-2">Postnr</th>
              <th className="p-2">Code</th>
              <th className="p-2">Title</th>
              <th className="p-2">Description</th>
              <th className="p-2">Unit</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Unit price</th>
              <th className="p-2">Comment</th>
              <th className="p-2">Line total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100 align-top">
                <td className="p-2">{item.postnr}</td>
                <td className="p-2">{item.code}</td>
                <td className="p-2 font-medium">{item.title}</td>
                <td className="whitespace-pre-wrap p-2 text-slate-600">{item.description}</td>
                <td className="p-2">{item.unit}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">
                  <input
                    type="number"
                    step="0.01"
                    value={item.unit_price ?? ''}
                    onChange={(event) =>
                      updateItem(item.id, {
                        unit_price: event.target.value === '' ? null : Number(event.target.value)
                      })
                    }
                    className="w-28 rounded border border-slate-300 px-2 py-1"
                  />
                </td>
                <td className="p-2">
                  <input
                    value={item.comment ?? ''}
                    onChange={(event) => updateItem(item.id, { comment: event.target.value })}
                    className="w-full rounded border border-slate-300 px-2 py-1"
                  />
                </td>
                <td className="p-2">{item.line_total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">{isPending ? 'Autosaving changes...' : 'All changes saved'}</p>
        <p className="text-lg font-semibold">
          Total: {total.toFixed(2)} {currency}
        </p>
      </div>
    </div>
  );
}
