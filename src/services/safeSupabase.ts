/**
 * Safely executes Supabase mutations without throwing uncaught exceptions or TypeScript errors
 */
export async function safeMutation(promiseLike: any): Promise<void> {
  if (!promiseLike) return;
  try {
    await promiseLike;
  } catch (err) {
    console.warn('Supabase operation notice:', err);
  }
}
