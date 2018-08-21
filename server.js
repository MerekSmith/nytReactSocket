
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const routes = require("./routes");
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3001;
// const socketPORT = process.env.PORT || 3002;

// Define middleware here
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
	app.use(express.static("client/build"));
}
// Add routes, both API and view
app.use(routes);

// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/articles");

// Start the API server
server.listen(PORT, function () {
	console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});



let socket;


io.on('connection', (socket) => {
	socket.on('article saved', (article) => {
		io.emit('alert', article);
	});
	
	});



let timer = 30;
setInterval(() => {
	if (timer === 0) {
		timer = "Time's Up!!"
		timer = 30;
	}
	io.emit('countdown', timer)
	timer--;
}, 1000);