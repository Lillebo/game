import App from './app.js';

var appDiv = document.getElementById('app');

App.render(appDiv);

if (module.hot) {
	module.hot.accept();
}