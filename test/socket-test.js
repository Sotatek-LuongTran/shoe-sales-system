const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  query: {
    userId: "a0e3d2d8-6885-4870-a241-9da3ab95d04e"
  }
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("orderExpired", (data) => {
  console.log("Order expired:", data);
});