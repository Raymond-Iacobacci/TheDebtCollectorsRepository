export async function verifyToken(uuid, token) {
  try {
    await fetch(
      `${import.meta.env.VITE_MIDDLEWARE_URL}/user/cookies/verify-cookie?user-id=${uuid}&token=${token}`
    ).then((response) => {
      if (response.status !== 200) {
        return false;
      }
      return true;
    });
  } catch (error) {
    console.log(`verifyToken API: ${error}`);
    return false;
  }
  return false;
}
