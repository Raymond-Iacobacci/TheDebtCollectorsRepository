// ----------------------------------------------------------------------

export async function getListTenants(uuid) {
  return fetch(
    `${import.meta.env.VITE_MIDDLEWARE_URL}/manager/tenants/get-tenants?manager-id=${uuid}`
  )
    .then((res) => res.json())
    .then((data) => data);
}

export async function createTenant(uuid_, first_, last_, email_, address_, rent_) {
  return fetch(
    `${import.meta.env.VITE_MIDDLEWARE_URL}/manager/tenants/create-tenant?manager-id=${uuid_}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: first_,
        lastName: last_,
        email: email_,
        address: address_,
        rent: rent_,
      }),
    }
  );
}
