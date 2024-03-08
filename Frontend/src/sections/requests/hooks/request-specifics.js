
// ----------------------------------------------------------------------

export async function getManagerRequests() {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/requests/get-manager-view?manager-id=${import.meta.env.VITE_TEST_MANAGER_ID}`)
    .then(res => res.json())
    .then(data => data);
}

export async function getHeaderInfo(id) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/requests/specifics/header-info?request-id=${id}`)
    .then(res => res.json())
    .then(data => data);
}

export async function getComments(id) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/requests/specifics/comments?request-id=${id}`)
    .then(res => res.json())
    .then(data => data);
}

export async function getAttachments(id) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/requests/specifics/attachments?request-id=${id}`)
    .then(res => res.json())
    .then(data => data);
}

