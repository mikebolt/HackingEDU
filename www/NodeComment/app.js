var http = require('http');
var url = require('url');
var fs = require('fs');

var newPostFormHtml = fs.readFileSync(views/post/new.html);

function renderNewHostForm (request, response){
    response.writeHead(200,{
        'Content-type': 'text/html'
    });
    response.end(newPostFormHtml);
}

function render404 (request,response){
    response.writeHead(404);
    response.end("404: File not found");
}

var server = http.createServer (function(request, response){
    var newPostForm = new RegExp("^/post/new/?$");
    var pathName = url.parse(request.url).pathname;
    if (newPostForm.test(pathName)){
        renderNewHostForm(request,response);
    }
    else {
        render404(request,response);
    }
});

server.listen(8000);

console.log("Listening on http://127.0.0.1:8000");
