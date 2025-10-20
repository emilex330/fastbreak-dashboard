export default function DebugPage() {
  return (
    <pre>
      {JSON.stringify(
        {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ missing URL",
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ exists" : "❌ missing KEY",
        },
        null,
        2
      )}
    </pre>
  );
}