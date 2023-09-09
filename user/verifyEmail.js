const { emailToDeveloper, sendResponse, verifyUserEmail } = require("../utils");
// sendResponse sends the response of the HTTP request
//validateInput validates the request for body data
exports.handler = async (event, context) => {
  try {
    // // const isValid = validateInput(event.body);
    // if (!isValid) return sendResponse(400, { message: "Invalid input" });

    const { email } = JSON.parse(event.body);

    const isUserEmailInDB = await verifyUserEmail(email);
    if (isUserEmailInDB){
      return sendResponse(200, {
        success: false,
        message: "Email is already registered, please use a different email.",
      });
    }
    return sendResponse(200, {
      success: true,
      message: "",
    });

    //make a call to verifyUserEmail and return a message based on the true or false, look at other functions and follow that structure. 

    // in yml file, create an endpoint so I can call it with postman
  } catch (error) {
    
    await emailToDeveloper(error, context);

    const message =
      "We're sorry but we hit a snag! It is not you, it's us. We'll be ready for you again soon. Please try again later.";
    return sendResponse(500, {
      success: false,
      message: message,
    });
  }
};

//make a query to the table, check if the user exists, if it exists, send response "user already exsists"

// save email in dynamo usertb. \

// create an index for the usertb based on email

// figure out how to create an index (using cloud formation), it is similar to how i created the table
// after index is created,  do a query in dynamoDb usertb

//index is created in the yml file, the query is in signup.js

// i can do a function called checkNewUser