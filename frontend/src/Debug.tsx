export const Debug = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Debug Page</h1>
      <p>React is working!</p>
      <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</p>
    </div>
  );
};