export const deps = {
  verifyToken: process.env.VERIFY_TOKEN,
  accessToken: process.env.ACCESS_TOKEN,
  phoneId: process.env.WA_PH_ID,
  port: process.env.PORT,
  apiURL: process.env.WA_API_URL,
};

export function checkEnv() {
  Object.entries(deps).forEach(([k, v]) => {
    if (!v) {
      console.warn(`Env var ${k} might be empty`);
    }
  });
}
