// ----------------------------------------------------------------------

export async function verifyToken(credentials) {
  return fetch(
    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${credentials.access_token}`
  )
    .then((res) => res.json())
    .then((data) => data);
}

export async function verifyProfile(type, email, newToken) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/user/cookies/login-${type}?email=${email}`,
  {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: newToken,
    }),
  })
    .then((res) => res.json())
    .then((data) => data);
}
