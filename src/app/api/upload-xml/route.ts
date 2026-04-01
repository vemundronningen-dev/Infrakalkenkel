import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { parseNs3459Xml } from '@/lib/xml-parser';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  const xmlContent = await file.text();
  const parsed = await parseNs3459Xml(xmlContent);

  const path = `${user.id}/${Date.now()}-${file.name}`;
  const { error: storageError } = await supabase.storage
    .from('xml-source-files')
    .upload(path, new Blob([xmlContent], { type: file.type || 'text/xml' }));

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 400 });
  }

  const estimateId = randomUUID();

  const { error: estimateError } = await supabase.from('estimates').insert({
    id: estimateId,
    user_id: user.id,
    project_name: parsed.project_name,
    currency: parsed.currency,
    original_file_path: path,
    source_xml: parsed.raw
  });

  if (estimateError) {
    return NextResponse.json({ error: estimateError.message }, { status: 400 });
  }

  const itemRows = parsed.items.map((item) => ({
    estimate_id: estimateId,
    ...item
  }));

  const { error: itemError } = await supabase.from('estimate_items').insert(itemRows);

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 400 });
  }

  return NextResponse.json({ estimateId });
}
