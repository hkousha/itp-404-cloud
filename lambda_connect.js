const AWS = require("aws-sdk");
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const table = "chat";

// This function will be called once a wss connection is established.
// It will add the connection_id to a dynamoDB table "chat"
exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const params = {
    Item: {
      connection_id: connectionId,
    },
    TableName: table,
  };
  await dynamoClient.put(params).promise();
  return {
    statusCode: 200,
  };
};
