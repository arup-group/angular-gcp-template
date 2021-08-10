'use strict';

exports.http = (request, response) => {
  console.log(request);
  response.status(200).send('Hello World!');
};

exports.event = (event, callback) => {
  console.log(event);
  callback();
};

exports.pubSub = (event, callback) => {
  console.log('PubSub message received!');
  console.log(event);
  callback();
};
