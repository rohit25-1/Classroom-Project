const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://rohit:4hsmDh1vWUltBN1g@cluster0.tnmk723.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((e) => {
    console.log(`Error: ${e}`);
  });
