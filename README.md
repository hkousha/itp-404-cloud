This repo contains the code and configurations needed to make the websocket chat runs on AWS.

_You can create a free AWS account [here](https://aws.amazon.com/free/)_

__important: Make sure you delete all the resources you create or you might get charged by AWS__

It uses these AWS Services:

- [S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html): to store the frontend code
- [dynamoDb](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html): key value database to store websocket connection IDs
- [APIGateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html): will be used to handle websocket connections
- [lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html): AWS FaaS implementation. It will be used to communicate between APIGateway and the DynamoDB


# Frontend:
We will build our front end and storing it to S3. By making the objects stored in S3 publicly accessible we will be able to access the frontend from anywhere.

To do this after cloning this repo:
- Navigate to the `chat-frontend` directory
- Run `npm run build`
- Navigate to the S3 bucket you want to upload the frontend to
- if you don't have a S3 bucket yet, you can create one [here](https://s3.console.aws.amazon.com/s3). 
   - You need to make sure the S3 bucket is public
- Upload all the files and directories from the build directory
   - Make sure before pressing upload you set the permission to publicly accessible


## Updating Websocket endpoint:
By default your frontend will try to connect to localhost. To have your frontend point to your APIGateway websocket endpoint, set `REACT_APP_WEBSOCKET_URL` environment then run `npm run build`.

ex:
```
REACT_APP_WEBSOCKET_URL="wss://fz16csxi4e.execute-api.us-east-2.amazonaws.com/production" npm run build
```

# Backend:
We will be using APIGateway for handling Websocket connections. ApiGateway doesn't store websockets reference, so we will need to handle that by ourself. We will be using DynamoDb to store the connection ids and lambda function to insert and scan the dynamoDb table. We will also use lambda function to forward the incoming messages to all the connected websockets.


1. Create a new dynamoDb:
	- Navigate to [dynamoDb](https://us-east-2.console.aws.amazon.com/dynamodbv2) AWS console page and click create table
	- Name the table `chat` and partition key to `connection_id`
	- Click create

2. Create the lambda function:
	- we will have 3 lambda functions:
		- lambda_connect.js which will be called by APIGateway and is responsible to insert the connection_id to dynamoDb
		- lambda_default.js will be called whenever a new message received. It will scan the dynamoDb for all the connection ids and forward the message to all of them
		- lambda_disconnect.js this function will be called whenever a websocket connection is dropped or terminated. It will delete the connection id from DynamoDb
	- creating a new IAM role for our lambda function:
		- our lambda functions will need to be able to talk to APIGateway and DynamoDb. To allow this we will need to create a new IAM role.
		- Navigate to [AWS IAM Role](https://console.aws.amazon.com/iamv2/home?#/roles) and click create role
		- Select Lambda
		- In `Attach permissions policies` search and select `AmazonAPIGatewayInvokeFullAccess` and `AmazonAPIGatewayAdministrator`. (Note: you can also select logs permissions if you would like to see the logs for your lambda functions)
		- click next give the Role a name and create the role
	- Navigate to [AWS Lambda page](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions) and create 3 lambda fuctions from scratch. give them a name and for permission select the newly permission you created
	- For each of the functions copy and paste the code to index.js and click deploy.
	- Note: for default lambda to work we will need to setup `APIGatewayEndpoint` environment variable. We will do that after we created the APIGateway


3. Create the APIGateway:
	- Navigate to [APIGateway console](https://us-east-2.console.aws.amazon.com/apigateway) and create a new WebSocket API
		- for `Route selection expression` enter `request.body.action`
	- After creating the APIGateway you will see 3 Routes (connect, disconnect and default). For each of these click on them and connect them to the appropriate lambda function.
	- After you are done with all 3 from Actions click on Deploy API and choose production for Deployment stage
	- Now you should have the WebSocketURL and ConnectionURL. Go back to your frontend and use the `WebSocketURL` to build the frontend and upload it to S3. Simillary you need to go back to default lambda function and set the environment variable for connection URL (without the `@connections` at the end)
