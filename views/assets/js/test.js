
var ua = window.navigator.userAgent;
console.log(ua);
var script;
if (ua === 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko' || ua === 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)') {
  script = document.createElement('script');
  script.src = '/dist/js/ie-assets.js';
  document.head.appendChild(script);
} else {
  script = document.createElement('script');
  script.src = '/dist/js/assets.js';
  document.head.appendChild(script);
}

var nextScript = document.createElement('script');
script.src = 'dist/js/main.js';
document.head.appendChild(script);