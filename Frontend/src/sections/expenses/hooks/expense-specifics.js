// ----------------------------------------------------------------------

export async function getRequests(uuid) {
  return fetch(
    `${import.meta.env.VITE_MIDDLEWARE_URL}/manager/requests/get-view?manager-id=${uuid}`
  )
    .then((res) => res.json())
    .then((data) => data);
}

export async function getExpenses(uuid) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/expenses/get-expenses?manager-id=${uuid}`)
    .then((res) => res.json())
    .then((data) => data);
}

export async function addExpense(manager, amount_, type_, request_, description_) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/expenses/add-expense?manager-id=${manager}`, {
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

export async function deleteExpense(id) {
  return fetch(`${import.meta.env.VITE_MIDDLEWARE_URL}/manager/expenses/delete-expense?expense-id=${id}`, {
    method: 'POST',
  });
}
