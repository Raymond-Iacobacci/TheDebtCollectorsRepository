
// ----------------------------------------------------------------------

export async function getManagerRequests(uuid) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/requests/get-view?manager-id=${uuid}`)
    .then(res => res.json())
    .then(data => data);
}

export async function getTenantRequests(uuid) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/tenant/requests/get-view?tenant-id=${uuid}`)
    .then(res => res.json())
    .then(data => data);
}


export async function getHeaderInfo(id) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/user/requests/get-request-info?request-id=${id}`)
    .then(res => res.json())
    .then(data => data);
}

export async function changeStatus(id, new_status) {
  await fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/user/requests/change-status?request-id=${id}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: new_status
    })
  });
}

export async function getComments(id) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/user/requests/get-comments?request-id=${id}`)
    .then(res => res.json())
    .then(data => data);
}

export async function newComment(id, user_id, commentField) {
  await fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/user/requests/add-comment?request-id=${id}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userID: user_id,
      comment: commentField
    })
  });
}

export async function getAttachments(id) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/user/requests/get-attachments?request-id=${id}`)
    .then(res => res.json())
    .then(data => data);
}

export async function deleteRequest(id) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/user/requests/delete-request?request-id=${id}`, {
    method: 'POST',
  });
}