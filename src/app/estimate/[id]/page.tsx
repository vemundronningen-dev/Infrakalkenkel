import { notFound } from 'next/navigation';
import { EstimateTable } from '@/components/estimate-table';
import { createClient } from '@/lib/supabase/server';

export default async function EstimateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: estimate } = await supabase
    .from('estimates')
    .select('id, user_id, project_name, currency, total_amount')
    .eq('id', id)
    .single();

  if (!estimate || estimate.user_id !== user?.id) {
    notFound();
  }

  const { data: items } = await supabase
    .from('estimate_items')
    .select('id, line_index, postnr, code, title, description, unit, quantity, unit_price, comment, line_total')
    .eq('estimate_id', id)
    .order('line_index', { ascending: true });

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{estimate.project_name}</h1>
        <p className="text-sm text-slate-600">Enter unit prices and comments. Changes autosave.</p>
      </div>
      <EstimateTable estimateId={estimate.id} currency={estimate.currency} initialItems={items ?? []} />
    </main>
  );
}
