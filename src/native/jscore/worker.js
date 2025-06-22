console.log('miniApp logic inited');

self.addEventListener('message', (message) => {
  console.log('logic worker receive message', message.data);
});
