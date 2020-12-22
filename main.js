const axios = require("axios");
const querystring = require("querystring");

const client = axios.create({
  baseURL: "https://sandbox.market-api.southpole.com/api",
});

const makeRequest = async (token, projectId, billingEmail, requestId) => {
  const timeLabel = `timing request ${requestId}`;
  console.log(`started request ${requestId} at ${Date.now()}`);
  console.time(timeLabel);

  const result = await client.post(
    `/offset-certificate?${querystring.stringify({
      t: token,
      c: "AUD",
      billing_name_on_certificate: "Luke",
      billing_city: "Sydney",
      billing_country_code: "AU",
      billing_email: billingEmail,
      billing_first_name: "Luke",
      billing_last_name: "Pathzero",
      billing_street: "Level 8/11-17 York St",
      billing_zip: "2000",
      noemail: 1,
    })}&p[${projectId}]=5`
  );

  console.timeEnd(timeLabel);

  return result;
};

async function run() {
  const sandboxApiToken = "<API Token>";
  const projectId = "<Project ID>";
  const email = "<Email Address>";
  const limit = limitOffset(5, 2000);

  try {
    const result = await Promise.all([
      makeRequest(sandboxApiToken, projectId, email, "1"),
      makeRequest(sandboxApiToken, projectId, email, "2"),
      makeRequest(sandboxApiToken, projectId, email, "3"),
      makeRequest(sandboxApiToken, projectId, email, "4"),
      makeRequest(sandboxApiToken, projectId, email, "5"),
    ]);

    const certificateIds = result.map(({ data }) => data.certificateId).sort();
    const orderIds = result.map(({ data }) => data.orderId).sort();

    console.log("certificateIds", certificateIds);
    console.log("orderIds", orderIds);

    for (let i = 0; i < certificateIds.length - 1; i++) {
      if (certificateIds[i] === certificateIds[i + 1]) {
        throw new Error("Conflicting results returned");
      }
    }
  } catch (e) {
    console.log("e", e);
  }
}

run();
