const AWS = require("aws-sdk");
// const { } = require("../functions");
const { emailToDeveloper, sendResponse, addNewUser } = require("../utils");
// sendResponse sends the response of the HTTP request
//validateInput validates the request for body data

const cognito = new AWS.CognitoIdentityServiceProvider();
exports.handler = async (event, context) => {


  try{

// // const isValid = validateInput(event.body);
// if (!isValid) return sendResponse(400, { message: "Invalid input" });

const { email, password, age, firstName } = JSON.parse(event.body);
const { user_pool_id } = process.env;

const params = {
  UserPoolId: user_pool_id,
  Username: email,
  UserAttributes: [
    {
      Name: "email",
      Value: email,
    },
    {
      Name: "email_verified",
      Value: "true",
    },
  ],
  MessageAction: "SUPPRESS",
};
const response = await cognito.adminCreateUser(params).promise();

console.log(response);
console.log(response.User.Attributes);
if (response.User) {
  const paramsForSetPass = {
    Password: password,
    UserPoolId: user_pool_id,
    Username: email,
    Permanent: true,
  };
  await cognito.adminSetUserPassword(paramsForSetPass).promise();
}

//TODO save to userTable, 
const item = {
  id: response.User.Attributes[0].Value,
  age: age,
  firstName: firstName,
  email: email,
}
await addNewUser(item);
return sendResponse(200, {
  success: true,
  message: "User registration successful",
});

} catch(error){
// console.log(error)
if (error.code == "UsernameExistsException"){
  return sendResponse(200, {
    success: false,
    message: "Email is already registered.",
  });
}
  await emailToDeveloper(error, context);

  const message =
    "We're sorry but we hit a snag! It is not you, it's us. We'll be ready for you again soon. Please try again later.";
  return sendResponse(500, {
    success: false,
    message: message,
  });

}
}

//make a query to the table, check if the user exists, if it exists, send response "user already exsists"

// save email in dynamo usertb. \

// create an index for the usertb based on email

// figure out how to create an index (using cloud formation), it is similar to how i created the table
// after index is created,  do a query in dynamoDb usertb

//index is created in the yml file, the query is in signup.js

// i can do a function called checkNewUser