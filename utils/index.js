// https://4a7vtq0f3e.execute-api.us-east-1.amazonaws.com/dev/quiz/questions/{id}

const NODEMAILER = require("nodemailer");
const AWS = require("aws-sdk");
const SES = new AWS.SES();
const questionTable = process.env.QUESTIONTABLE;
const usersTable = process.env.USERTABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

async function addNewQuestion(item) {
  const params = {
    TableName: questionTable,
    Item: item,
  };

  return dynamoDbClient.put(params).promise();
}

async function addNewUser(item) {
  const params = {
    TableName: usersTable,
    Item: item,
  };

  return dynamoDbClient.put(params).promise();
}

async function verifyUserEmail(email) {
  const params = {
    TableName: usersTable,
    IndexName: "indexEmail",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email.toLowerCase()
    },
  };
const response = await dynamoDbClient.query(params).promise();
return response.Count < 1 ? false:true;
}

async function emailToDeveloper(error, context) {
  const FROM_EMAIL = process.env.FROMEMAIL;
  const DEVELOPER = process.env.DEVELOPEREMAIL;

  const mailOptions = {
    from: {
      name: " - ERROR",
      address: FROM_EMAIL,
    },
    subject: `Error: ${error.message}`,
    html: `<p>There was an error. See below: </p>


<b>Function Name: </b> ${context.functionName}<br />
<b>CloudWatch Log Stream Name: </b> ${context.logStreamName}<br />
<b>CloudWatch Log Group Name: </b> ${context.logGroupName}<br />
<b>Lambda Request Id: </b>${context.awsRequestId}<br />
<b>Lambda Function Memory Limit (MB):</b> ${context.memoryLimitInMB}


<br />


<p><u>Error object</u></p>


<b>Message: </b>${error.message}<br />
<b>Code: </b>${error.code}<br />
<b>Time: </b>${error.time}<br />
<b>EST Date/Time: </b>${localeDateEST()}<br />
<b>RequestId: </b>${error.requestId}<br />
<b>StatusCode: </b>${error.statusCode}


<br />
<br />`,
    to: DEVELOPER,
  };

  //console.log("Creating SES transporter");
  // create Nodemailer SES transporter
  const transporter = NODEMAILER.createTransport({
    SES: SES,
  });

  const response = await new Promise((rsv, rjt) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        rjt(error);
      }

      rsv(true);
    });
  });
}

const localeDateEST = () => {
  return new Date(
    Date.parse(
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    )
  );
};



const sendResponse = (statusCode, body) => {
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
  return response;
};

module.exports = { sendResponse, emailToDeveloper, addNewQuestion, addNewUser, verifyUserEmail };
