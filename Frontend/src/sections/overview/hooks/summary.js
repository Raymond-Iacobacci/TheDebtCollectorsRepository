// ----------------------------------------------------------------------

export async function getNumberTenants(uuid) {
  return fetch(
    `${import.meta.env.VITE_MIDDLEWARE_URL}/dashboard/get-number-of-tenants?manager-id=${uuid}`
  )
    .then((res) => res.json())
    .then((data) => data);
}

export async function getNumberPayments(uuid) {
  return fetch(
    `${import.meta.env.VITE_MIDDLEWARE_URL}/dashboard/get-number-of-rent-payments?manager-id=${uuid}`
  )
    .then((res) => res.json())
    .then((data) => data);
}

export async function getNumberRequests(uuid) {
    return fetch(
      `${import.meta.env.VITE_MIDDLEWARE_URL}/dashboard/get-number-of-unresolved-requests?manager-id=${uuid}`
    )
      .then((res) => res.json())
      .then((data) => data);
  }
  