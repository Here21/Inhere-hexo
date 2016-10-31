var spawn = require('child_process').spawn;

// Hexo 2.x
hexo.on('new', function(path){
  spawn('code', [path]);
});

// Hexo 3
hexo.on('new', function(data){
  spawn('code', [data.path]);
});