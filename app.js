// TODO: Обработка ошибок
// TODO: TS style
// TODO: управление кэшем. Ничего не кэшировать т.к. данные могут меняться
const express = require('express');
const axios = require('axios');

const urlRegEx = new RegExp('"(https:\/\/image\.prntscr\.com\/image\/[^"]+)"');

const config = require("./appconfig.json");

const app = express();
const port = config.port;
const uiConfig = config.uiConfig;

async function getImageUrl(indexNumber){
	return axios
		.get(`https://prnt.sc/${indexNumber}`)
		.then(res => {
			return res.data.match(urlRegEx)[1];
		})
		.catch(error => {
			console.error(error);
		});
};

async function getImageData(indexNumber){
	const imageUrl = await getImageUrl(indexNumber);
	if (!imageUrl){
		return;
	}

	const imageData = await axios({
		url: imageUrl,
		method: 'GET',
    	responseType: 'stream'
	});

	return imageData.data;
}

app.use(express.static('public'));

app.get('/uiinfo', (req, res) => {
	res.send(uiConfig); // TODO: why 304 status
});

app.get('/img', (req,res) => {
	getImageData(req.query.index)
		.then(imageData => imageData && imageData.pipe(res) || res.sendStatus(404))
		.catch(exception => res.sendStatus(404));
});

app.get('/', (_req, res) => {
  res.send('loader_2.html');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});