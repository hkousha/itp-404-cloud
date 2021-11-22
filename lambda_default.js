var AWS = require('aws-sdk');
var http = require('http');
var dynamoClient = new AWS.DynamoDB.DocumentClient();
var table = "chat";

const APIHost = process.env.APIGatewayEndpoint

// This function is being called whenever there is a new message is recieaved.
// It will get the list of all connectionIds from dynamoDB table chat and then
// uses apiGateWay @connections to braodcast the message.
// more info: https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-how-to-call-websocket-api-connections.html
exports.handler = async (event) => {
    // Get list of clients.
    const params = {
        TableName: table
    };
    var apig = new AWS.ApiGatewayManagementApi(
    	{
    		region: "us-east-2",
    		endpoint: APIHost
    	});

    var clients = {}
    try {
        clients = await dynamoClient.scan(params).promise();
    } catch(err){
        console.log("got error: ", err)
        return {
            statusCode: 500
        }
    }

    // forward the message to all clients one by one.
    for (let i=0; i< clients.Items.length; i++){
        let connectionId = clients.Items[i].client_id
		try {
			await apig.postToConnection({
				ConnectionId: connectionId,
				Data: JSON.stringify(event),
			}).promise();

			console.log("request is done")
		} catch(err) {
			console.log("got error forwarding message: ", err)
		}

    }

    return {
        statusCode: 200
    }
};
