var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

app.get('/', function(req, resp) {
   resp.send('To do API root');
});

app.listen(PORT, function() {
    console.log('Server launched on port ' + PORT + '!');
});
