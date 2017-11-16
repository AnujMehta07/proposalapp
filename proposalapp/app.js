var path = require('path'),
	express = require('express');

var app = express();

app.use('/', express.static(path.join(__dirname, 'webapp')));

app.listen(process.env.PORT || 3000, function () {
	console.log('Proposal app is listening on port 3000!');
});