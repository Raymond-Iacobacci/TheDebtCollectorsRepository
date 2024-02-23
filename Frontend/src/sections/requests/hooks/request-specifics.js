
// ----------------------------------------------------------------------


export async function testAPICall(id) {
  try {
    const url = `${import.meta.env.VITE_MIDDLEWARE_URL}/show-requests`;
    const response = await fetch(url, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = response.json();
    return data;
  } catch (error) {
    console.error('API call error:', error.message);
    throw error;
  }
}
