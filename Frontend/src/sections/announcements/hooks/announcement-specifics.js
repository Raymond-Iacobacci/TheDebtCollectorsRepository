// ----------------------------------------------------------------------

export async function getAnnouncements(uuid, access) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/${access}/announcements/get-announcements?${access}-id=${uuid}`)
    .then((res) => res.json())
    .then((data) => data);
}

export async function addAnnouncement(manager, title_, description_) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/announcements/make-announcement?manager-id=${manager}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: title_,
      description: description_
    }),
  });
}
