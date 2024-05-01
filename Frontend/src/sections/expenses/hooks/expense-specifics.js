// ----------------------------------------------------------------------

export async function getRequests(uuid) {
  return fetch(
    `${import.meta.env.VITE_MIDDLEWARE_URL}/requests/get-manager-view?manager-id=${uuid}`
  )
    .then((res) => res.json())
    .then((data) => data);
}

export async function getExpenses(uuid) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/get-expenses?manager-id=${uuid}`)
    .then((res) => res.json())
    .then((data) => data);
}

export async function addExpense(manager, amount_, type_, request_, description_) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/add-expense?manager-id=${manager}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount_,
      type: type_,
      description: description_,
      requestID: request_
    }),
  });
}
