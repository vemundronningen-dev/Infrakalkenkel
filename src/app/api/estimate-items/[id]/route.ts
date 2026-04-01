import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const unitPrice = payload.unit_price === null || payload.unit_price === undefined ? null : Number(payload.unit_price);

  const { data: existingItem, error: itemError } = await supabase
    .from('estimate_items')
    .select('id, estimate_id, quantity')
    .eq('id', id)
    .single();

  if (itemError || !existingItem) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  const { data: estimate } = await supabase.from('estimates').select('id, user_id').eq('id', existingItem.estimate_id).single();

  if (!estimate || estimate.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const lineTotal = unitPrice === null ? 0 : Number(existingItem.quantity) * unitPrice;

  const { error: updateError } = await supabase
    .from('estimate_items')
    .update({
      unit_price: unitPrice,
      comment: typeof payload.comment === 'string' ? payload.comment : undefined,
      line_total: lineTotal
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  await supabase.rpc('recalculate_estimate_total', { estimate_uuid: existingItem.estimate_id });

  return NextResponse.json({ ok: true });
}
