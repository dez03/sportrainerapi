const { sendResponse, emailToDeveloper, addNewQuestion } = require("../utils");

 exports.handler = async (event, context) => {
  try {
    const { questionName } = JSON.parse(event.body);
    const id = event.requestContext.requestId;
    const item = {
      id: id,
      questionName: questionName,
      createDate: new Date().getTime(),
    }

    await addNewQuestion(item); 

    return sendResponse(200, {
      success: true,
      message: id,
    });
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
// do a try catch block in sign upjs