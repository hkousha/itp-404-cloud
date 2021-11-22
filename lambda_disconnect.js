const AWS = require('aws-sdk');
var dynamoClient = new AWS.DynamoDB.DocumentClient();
var table = "chat";

// This function will be called once a wss connection is ended.
// It will delete the connection_id from the dynamoDB table  "chat"
exports.handler = async (event) => {
	const connectionId = event.requestContext.connectionId
	console.log("got event: ", event)

	const params = {
		Key: {
			client_id: connectionId
		},
		TableName: table
	};

	try {
		const data = await dynamoClient.delete(params).promise();
		return {
			statusCode: 200
		};
	} catch(err){
		console.log("failed to delete with error: ", err)
		return {
			statusCode: 500
		};
	}

};
