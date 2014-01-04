var fs = require("fs"),
    // npm install express
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    // npm install twit
    twitt = require('twit'),
    /* Pour lire une configuration a partir d'un fichier JSON externe, ici on lit le port
     On utilise readFileSync (synchrone) pour exécuter en séquentiel avant toute tentative de démarrage serveur sans port définit*/
    config = JSON.parse(fs.readFileSync("config.json")),
    port = config.port,
    io = require('socket.io').listen(server);
    
    server.listen(port);
// on affiche le port du serveur
console.log('Nous sommes en ecoute sur le port  ' + port);

// Servir le fichier index.html en racine
app.get('/', function (req, res) {
res.sendfile(__dirname + '/index.html');
});

// On définit les mots clés qu'on veut chercher
var motsCles = ['node.js', 'javascript', 'nodejs'];

// Ici on met les paramètre de l'app Twitter pour pouvoir s'authentifier (à partir de l'Api 1.1 l'authentification est nécessaire)
 var t = new twitt({
  consumer_key:         'B9CspWLPwuUaDhG7dNr9hQ',
  consumer_secret:      'wCTD2yErqVSu7l2b57IyGs0NvYaa3IWgKvF5ZmVbE',
  access_token:         '14268319-2hxLjblVKhXSQT9M9BqRKmelMDRChtFdT79mbZCQl',
  access_token_secret:  'rjKtTmoODGUAzkQjz89COrYL9gat9HpCkMgRPiKlhAsZg'
})

io.sockets.on('connection', function (socket) {
  console.log('Nous sommes connectés');
//envoyer la requete pour avoir les tweets
 var stream = t.stream('statuses/filter', { track: motsCles })

  stream.on('tweet', function (tweet) {
//Envoyer les Tweets
    io.sockets.emit('stream',tweet.text);

  });
 });

/* Cette partie du code est optionnelle mais parfois il est utile d'utiliser watchFile() pour detecter 
toute modification sur un fichier de configuration et d'appliquer les changements et redemarrer notre application
d'une façon transparent, donc ici si on modifie le fichier config.json le serveur se lancera avec le nouveau port */
fs.watchFile("config.json", function() {
  fs.readFile("config.json", function(error, data) {
    config = JSON.parse(data);
    server.close();
    port = config.port;
    server.listen(port, function() {
      console.log("Maintenant, on ecoute sur le port : "  + port);
    });
  });

});
