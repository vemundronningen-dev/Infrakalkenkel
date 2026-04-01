import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: estimates } = await supabase
    .from('estimates')
    .select('id, project_name, currency, total_amount, updated_at')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false });

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your estimates</h1>
        <Link href="/estimate/new" className="rounded bg-slate-900 px-4 py-2 text-white">
          New estimate
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Project</th>
              <th className="p-3">Currency</th>
              <th className="p-3">Total</th>
              <th className="p-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {estimates?.map((estimate) => (
              <tr key={estimate.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-3">
                  <Link href={`/estimate/${estimate.id}`} className="font-medium text-slate-900 hover:underline">
                    {estimate.project_name}
                  </Link>
                </td>
                <td className="p-3">{estimate.currency}</td>
                <td className="p-3">{estimate.total_amount.toFixed(2)}</td>
                <td className="p-3">{new Date(estimate.updated_at).toLocaleString()}</td>
              </tr>
            ))}
            {!estimates?.length ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  No estimates yet. Upload your first XML file.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
