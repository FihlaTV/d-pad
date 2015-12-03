;(function() {

  var DPad = function() {
    this.socket = null;
    this.currentAction = '';
    this.currentDirection = '';
    this.currentId = '';
    this.dataReceived = null;
    this.playerName = '';
    this.vibrate =
        navigator.vibrate ||
        navigator.webkitVibrate ||
        navigator.mozVibrate ||
        navigator.msVibrate;
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
          var dpadContainer = document.getElementById('container-dpad'),
              playerType = document.getElementById('type-of-player'),
              htmlObject = document.getElementsByTagName('html')[0],
              form = document.getElementsByTagName('form')[0];

          self.dataReceived = JSON.parse(e.data);
          console.log(e.data);

          if (
            self.dataReceived &&
            self.dataReceived.role &&
            self.dataReceived.color
          ) {
            //Hide form, show the d-pad, update the player type and applies the color
            dpadContainer.style.display = 'block';
            playerType.innerHTML = (self.dataReceived.role).toUpperCase();
            htmlObject.style.background = self.dataReceived.color;
          }
      }

      this.socket.onclose = function(e) {
          var errorMessage = document.getElementById('error-message')
              dpadContainer = document.getElementById('container-dpad'),
              playerType = document.getElementById('type-of-player'),
              htmlObject = document.getElementsByTagName('html')[0],
              switchOff = document.getElementById("switch-off"),
              form = document.getElementsByTagName('form')[0];

          //Restart the initial value
          switchOff.checked = true;
          dpadContainer.style.display = 'none';
          playerType.innerHTML = '';
          htmlObject.style.background = 'dimgrey';
          errorMessage.innerHTML = 'Connection closed';
          console.log("Connection closed.");

      }
    },
    restartData: function() {
        this.socket = null;
        this.currentAction = '';
        this.currentDirection = '';
        this.currentId = '';
        this.dataReceived = null;
        this.isopen = false;
        this.playerName = '';
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
    sendAction: function(type, direction, element) {
        if (element) {
          var buttons = document.getElementsByClassName('dpad');
          for (var i = 0; i < buttons.length; i++) {
            this.removeClass(buttons[i], 'pressed');
          }

          this.addClass(element, 'pressed');
        }
        if (this.socket !== null && this.socket.isopen) {
            var payload = {
                action: type,
                name: !!this.playerName ? this.playerName : '',
                position: !!this.dataReceived ? this.dataReceived.position : null
            };
            switch (type) {
              case 'direction':
                if (this.currentDirection !== direction) {
                    this.currentDirection = direction;
                    payload.direction = direction;
                    this.socket.send(JSON.stringify(payload));
                    if (this.vibrate) {
                      // vibration API supported
                      navigator.vibrate(200);
                    }
                }
                break;
              case 'want-to-play':
                this.socket.send(JSON.stringify(payload));
                console.log(payload);
                break;
            }
        }
    },
    isFormFilled: function() {
      var ipField = document.getElementById('ip-input'),
          nameField = document.getElementById('name-input'),
          errorMessage = document.getElementById('error-message');

      errorMessage.innerHTML = '';
      if (ipField.value !== '' && nameField.value !== '') {
        document.getElementById('switch').style.display = 'block';
      } else {
        document.getElementById('switch').style.display = 'none';
      }
    },
    addClass: function(target, className) {
        if (typeof className === 'string') {
            target.className += ' ' + className;
        }
    },
    removeClass: function(target, className) {
        if (typeof className === 'string') {
            var classes = target.className.split(' '),
                position = classes.indexOf(className);
            if (position > -1) {
                classes.splice(position);
                target.className = classes.join(' ');
            }
        }
    },

  };

  window['DPad'] = window['DPad'] || {};
  window['DPad'] = new DPad();
})();
