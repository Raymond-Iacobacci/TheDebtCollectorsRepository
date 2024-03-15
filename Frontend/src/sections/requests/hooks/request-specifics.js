
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

export async function changeStatus(id, new_status) {
  await fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/requests/specifics/change-status?request-id=${id}`, {
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
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/requests/specifics/comments?request-id=${id}`)
    .then(res => res.json())
    .then(data => data);
}

export async function newComment(id, user_id, commentField) {
  await fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/requests/specifics/new-comment?request-id=${id}`, {
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
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/requests/specifics/attachments?request-id=${id}`)
    .then(res => res.json())
    .then(data => data);
}

