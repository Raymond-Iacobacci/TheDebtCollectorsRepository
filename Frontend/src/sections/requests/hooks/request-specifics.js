
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

export async function newComment(id, user_id, commentField) {
  fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/requests/specifics/new-comment?request-id=${id}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userID: user_id,
      comment: commentField
    })
  }).then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.log(err))
}

export async function getAttachments(id) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/requests/specifics/attachments?request-id=${id}`)
    .then(res => res.json())
    .then(data => data);
}

