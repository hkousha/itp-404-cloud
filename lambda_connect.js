const AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({region: "us-east-2"});
var table = "chat";

exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId
    console.log("got event: ", event)

    const params = {
        Item: {
            client_id: connectionId
        },
        TableName: table
    };

    try {
        const data = await docClient.put(params).promise();
         return {
            statusCode: 200
            };
    } catch(err){   
        return {
            statusCode: 500
            };
    }

};
