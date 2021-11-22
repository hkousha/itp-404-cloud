var AWS = require('aws-sdk');
var http = require('http');
var dynamoClient = new AWS.DynamoDB.DocumentClient({region: "us-east-2"});
var table = "chat";

const APIHost = "https://fz16csxi4e.execute-api.us-east-2.amazonaws.com/test/"


exports.handler = async (event) => {
    const params = {
        TableName: table
    };

    var apig = new AWS.ApiGatewayManagementApi(
    	{
    		region: "us-east-2"
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
