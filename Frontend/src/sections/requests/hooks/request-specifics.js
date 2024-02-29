
// ----------------------------------------------------------------------


export async function getHeaderInfo(id) {
  const url = `${import.meta.env.VITE_MIDDLEWARE_URL}/requests/specifics/header-info?request-id=${id}`;
  const response = await fetch(url, {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error(`Failed with status ${response.status}`);
  }
  const data = response.json();
  return data;
}

export async function getComments(id) {
  const url = `${import.meta.env.VITE_MIDDLEWARE_URL}/requests/specifics/comments?request-id=${id}`;
  const response = await fetch(url, {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error(`Failed with status ${response.status}`);
  }
  const data = response.json();
  return data;
}
