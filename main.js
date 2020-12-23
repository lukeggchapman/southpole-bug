const axios = require("axios");
const querystring = require("querystring");

const client = axios.create({
  baseURL: "https://sandbox.market-api.southpole.com/api",
});

const token = "<API Token>";
const email = "<email>";

const makeRequest = async (requestInput) => {
  const { projectId, requestId, tonnes, firstName, lastName } = requestInput;
  const timeLabel = `timing request ${requestId}`;
  console.log(`started request ${requestId} at ${Date.now()}`);
  console.time(timeLabel);

  // Create the order and offset-certificate
  const certificateResult = await client.post(
    `/offset-certificate?${querystring.stringify({
      t: token,
      c: "AUD",
      billing_name_on_certificate: "Luke",
      billing_city: "Sydney",
      billing_country_code: "AU",
      billing_email: email,
      billing_first_name: firstName,
      billing_last_name: lastName,
      billing_street: "Level 8/11-17 York St",
      billing_zip: "2000",
      noemail: 1,
    })}&p[${projectId}]=${tonnes}`
  );

  console.log(`getting order details for ${requestId}`);
  // Fetch the order details
  const orderDetailsResult = await client.get(
    `/order-details?${querystring.stringify({
      t: token,
      o: certificateResult.data.orderId,
    })}`
  );

  console.timeEnd(timeLabel);

  // Return a struct with all request related data
  return {
    requestId,
    requestInput,
    certificateResult,
    orderDetailsResult,
  };
};

/**
 * Check that the requestInput matches the created order, logging the results
 */
const checkRequest = async ({
  requestId,
  requestInput,
  certificateResult,
  orderDetailsResult,
}) => {
  const orderDetails = orderDetailsResult.data.order;

  if (
    orderDetails.total_credits === requestInput.tonnes &&
    orderDetails.name ===
      `API ${requestInput.firstName} ${requestInput.lastName}` &&
    orderDetails.projects[0].no === requestInput.projectId
  ) {
    console.log(
      `Request ${requestId} completed successfully with order ${certificateResult.data.orderId}`
    );
  } else {
    console.error(
      `Request ${requestId} returned incorrect data with order ${certificateResult.data.orderId}`
    );
    console.info("requestInput", requestInput);
    console.info("orderDetailsResult.data", orderDetailsResult.data.order);
  }
};

const orders = [
  {
    requestId: "1",
    firstName: "One",
    lastName: "Pathzero",
    projectId: 302745,
    tonnes: 1,
  },
  {
    requestId: "2",
    firstName: "Two",
    lastName: "Pathzero",
    projectId: 302222,
    tonnes: 2,
  },
  {
    requestId: "3",
    firstName: "Three",
    lastName: "Pathzero",
    projectId: 300180,
    tonnes: 3,
  },
  {
    requestId: "4",
    firstName: "Four",
    lastName: "Pathzero",
    projectId: 302745,
    tonnes: 4,
  },
  {
    requestId: "5",
    firstName: "Five",
    lastName: "Pathzero",
    projectId: 302222,
    tonnes: 5,
  },
];

async function run() {
  try {
    const result = await Promise.all(orders.map(makeRequest));

    result.forEach(checkRequest);
  } catch (e) {
    console.log("e", e);
  }
}

run();
