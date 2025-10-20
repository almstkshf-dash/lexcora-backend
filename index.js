require("dotenv").config();
const app = require("./src/app");

const PORT = 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  
});
