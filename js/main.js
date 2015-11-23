;(function() {
  
  var DPad = function() {
    this.socket = null;
    this.currentAction = '';
    this.currentId = '';
    this.dataReceived = null;
    this.playerName = '';
  };
  DPad.prototype = {
    initSocketConnection: function() {
      var self = this;    
    
      this.remoteAddress = document.getElementById('ip-input').value;
      this.socket = new WebSocket('ws://' + this.remoteAddress + ':9000');

      this.socket.onopen = function() {
          this.isopen = true;
          console.log("Connected!");
          
          self.sendAction('want-to-play');
      }

      this.socket.onmessage = function(e) {
          self.dataReceived = JSON.parse(e.data);
          console.log(e.data);
      }

      this.socket.onclose = function(e) {
          console.log("Connection closed.");
          this.socket = null;
          this.isopen = false;
      }
    },
    enable: function(option) {
      var nameInput = document.getElementById('name-input'),
          errorMessage = document.getElementById('error-message');
        
      if (option) {
        if (nameInput.value !== '') {
            errorMessage.innerHTML = '';
            this.playerName = nameInput.value;
            this.initSocketConnection();
        } else {
            errorMessage.innerHTML = 'Please introduce a funny name';
        }
      } else {
        var reasonId = !!this.dataReceived ? this.dataReceived.position : 'none';
        this.socket.close(1000, reasonId);
      }
    },
    sendAction: function(type, direction) {
        if (this.socket !== null && this.socket.isopen) {
            var payload = {
                action: type,
                name: !!this.playerName ? this.playerName : '',
                position: !!this.dataReceived ? this.dataReceived.position : null
            };
            if (!!direction) {
                payload.direction = direction;
            }
            this.socket.send(JSON.stringify(payload));
            console.log(payload);
        }
    },
    testIp: function(field) {
      var re = new RegExp('^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$');
      if (re.test(field.value)) {
        document.getElementById('switch').style.display = 'block';
      } else {
        document.getElementById('switch').style.display = 'none';
      }  
    }
  };
  
  window['DPad'] = window['DPad'] || {};
  window['DPad'] = new DPad();
})();