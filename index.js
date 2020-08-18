require('dotenv').config();

const express = require('express');
const app = express();
const port = 8080;
const mongoose = require('mongoose');
const uri = 'mongodb+srv://<uname>:<password>@cluser-0.vj8z0.mongodb.net/<dbname>?retryWrites=true&w=majority';
const axios = require('axios');
const AccessToken = require('./model/AccessToken');
const STREAMLABS_API_BASE = 'https://www.streamlabs.com/api/v1.0';
const streamlabsRoute = 'user'; // donations,

app.get('/', async (req, res) => {
  await AccessToken.countDocuments({}, async function (err, count) {
    if (count > 0) {
      await AccessToken.findOne({}, function (err, result) {
        axios.get(`${STREAMLABS_API_BASE}/${streamlabsRoute}?access_token=${result.access_token}`).then((response) => {
          res.send(`<pre>${JSON.stringify(response.data.data) || JSON.stringify(response.data)}</pre>`);
        });
      });
    } else {
      let authorize_url = `${STREAMLABS_API_BASE}/authorize?`;

      let params = {
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        response_type: 'code',
        scope: 'donations.read+donations.create',
      };

      // not encoding params
      authorize_url += Object.keys(params)
        .map((k) => `${k}=${params[k]}`)
        .join('&');

      res.send(`<a href="${authorize_url}">Authorize with Streamlabs!</a>`);
    }
  });
});
app.get('/auth', (req, res) => {
  let code = req.query.code;

  axios
    .post(`${STREAMLABS_API_BASE}/token?`, {
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      code: code,
    })
    .then((response) => {
      AccessToken.create(
        { access_token: response.data.access_token, refresh_token: response.data.refresh_token },
        () => {
          res.redirect('/');
        }
      );
    })
    .catch((error) => {
      console.log(error);
    });
});

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function () {
  console.log('Connected to DB');
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
