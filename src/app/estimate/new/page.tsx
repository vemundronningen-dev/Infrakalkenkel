'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewEstimatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setError('Please choose an XML file first.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload-xml', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error ?? 'Failed to upload XML.');
      setLoading(false);
      return;
    }

    const payload = await response.json();
    router.push(`/estimate/${payload.estimateId}`);
  };

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Create estimate from XML</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <input
          type="file"
          accept=".xml,text/xml"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full rounded border border-slate-300 p-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload and parse'}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </main>
  );
}
