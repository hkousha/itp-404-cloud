const AWS = require("aws-sdk");
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const table = "chat";

const APIHost = process.env.APIGatewayEndpoint;

// This function is being called whenever there is a new message is recieaved.
// It will get the list of all connectionIds from dynamoDB table "chat" and then
// uses apiGateWay @connections to braodcast the message.
// more info: https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html
exports.handler = async (event) => {
  // Get list of clients.
  const params = {
    TableName: table,
  };
  const apig = new AWS.ApiGatewayManagementApi({
    region: "us-east-2",
    endpoint: APIHost,
  });

  const clients = await dynamoClient.scan(params).promise();

  // forward the message to all clients one by one.
  for (let i = 0; i < clients.Items.length; i++) {
    let connectionId = clients.Items[i].connection_id;
    await apig
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(event),
      })
      .promise();
  }
  return {
    statusCode: 200,
  };
};
