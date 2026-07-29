const http = require('http');

const url = 'http://localhost:3000/api/books?q=' + encodeURIComponent('doraemon');

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const payload = JSON.parse(data);
      console.log('=== BACKEND API RESPONSE FOR "doraemon" ===');
      console.log(JSON.stringify(payload, null, 2));
    } catch (err) {
      console.error(err);
    }
  });
}).on('error', (err) => {
  console.error(err);
});
