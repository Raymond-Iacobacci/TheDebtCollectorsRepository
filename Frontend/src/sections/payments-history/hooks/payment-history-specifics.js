// ----------------------------------------------------------------------

export async function getLedger(uuid) {
  return fetch(
    `${import.meta.env.VITE_MIDDLEWARE_URL}/user/transactions/get-ledger?tenant-id=${uuid}`
  )
    .then((res) => res.json())
    .then((data) => data);
}

export async function getName(uuid) {
  return fetch(
    `${import.meta.env.VITE_MIDDLEWARE_URL}/user/profile-info/get-attributes?user-id=${uuid}`
  )
    .then((res) => res.json())
    .then((data) => data);
}

export async function makePayment(uuid, amount_, description_) {
  return fetch(
    `${import.meta.env.VITE_MIDDLEWARE_URL}/tenant/transactions/make-payment?tenant-id=${uuid}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount_,
        description: description_,
      }),
    }
  );
}

export async function createCharge(uuid, amount_, description_) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/transactions/create-charge`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tenantID: uuid,
      description: description_,
      amount: amount_,
    }),
  });
}

export async function createCredit(uuid, amount_, description_) {
    return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/transactions/create-credit`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantID: uuid,
          description: description_,
          amount: amount_,
        }),
      });
}