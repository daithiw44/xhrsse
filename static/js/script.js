(function() {
  //Declarations
  var XMLHttpFactories, source;

  //Utilities
  XMLHttpFactories = [
    function() {return new XMLHttpRequest()},
    function() {return new ActiveXObject('Msxml2.XMLHTTP')},
    function() {return new ActiveXObject('Msxml3.XMLHTTP')},
    function() {return new ActiveXObject('Microsoft.XMLHTTP')}
  ];

  function $() {
    var i, element, elements = [];
    for (i = 0; i < arguments.length; i++) {
      element = arguments[i];
      if (typeof element == 'string') {
        element = document.getElementById(element);
      }
      if (arguments.length === 1) {
        return element;
      }
      elements.push(element);
    }
    return elements;
  }

  function createXMLHTTPObject() {
    var i, xmlhttp = false;
    for (i = 0; i < XMLHttpFactories.length; i++) {
      try {
        xmlhttp = XMLHttpFactories[i]();
      }
      catch (e) {
        continue;
      }
      break;
    }
    return xmlhttp;
  }

  function addEvent(node, type, listener) {
    if (!(node = $(node))) return false;
    if (node.addEventListener) {
      node.addEventListener(type, listener, false);
      return true;
    } else if (node.attachEvent) {
      // MSIE method
      node['e' + type + listener] = listener;
      node[type + listener] = function() {
        node['e' + type + listener](window.event);
      }
      node.attachEvent('on' + type, node[type + listener]);
      return true;
    }
    return false;
  }

  //SSE
  function returnES() {
    return new EventSource('stream');
  }

  source = returnES();

  source.onmessage = function(event) {
    var sse = JSON.parse(event.data);
    $('display_' + sse.channel).innerHTML = sse.message;
  };

  source.onerror = function() {
    //console.log('there has been an error');
    if (source.readyState === 2) {
      //console.log('set it up Again');
      source.readyState = 0;
      setInterval(function() {
        //console.log(source.readyState);
      }, 1000);
    } else {
      //console.log(source.readyState);
    }
  };

  function sendRequest(url, callback, postData) {
    var req = createXMLHTTPObject();
    if (!req) return;
    var method = (postData) ? 'POST' : 'GET';
    req.open(method, url, true);
    req.setRequestHeader('Content-type', 'application/json');
    if (postData)
      req.onreadystatechange = function() {
        if (req.readyState != 4) return;
        if (req.status != 200 && req.status != 304) {
          alert('HTTP error ' + req.status);
          return;
        }
        callback(req.responseText);
      }
      if (req.readyState == 4) return;
      req.send(postData);
  }

  function tuneIn(channel) {
    sendRequest('channel',
        function(o) { xhrRes(o)},
        '{"channel":"' + channel + '"}');
  }

  addEvent($('channels'), 'click', function(e) {
    tuneIn(e.target.id);
  });

  function xhrRes(o) {
    var xhr = JSON.parse(o),
        message = '';
    if (xhr.tune === 'add') {
      message = 'Awaiting Signal';
    } else {
      message = 'End of Transmission';
    }
    $('display_' + xhr.channel).innerHTML = message;
  }

})();
