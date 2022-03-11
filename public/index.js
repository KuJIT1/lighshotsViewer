//TODO: handle exceptions

'use strict';

function initPage(uiConfig){
	const defaultIndexNumber = uiConfig.defaultIndexNumber;
	const indexNumberLength = uiConfig.indexNumberLength;
	
	const storeIndexNumberKey = 'indexNumber';
	
	const valueElement = document.getElementById('navigate');
	const imageContainerElement = document.querySelector('.img-container');
	
	const symbolsAxis = '0123456789abcdefghijklmnopqrstuvwxyz';
	
	let indexNumber = localStorage.getItem(storeIndexNumberKey) || defaultIndexNumber;
	
	function reLoadImage() {
		valueElement.value = indexNumber;
		imageContainerElement.innerHTML = `<img src="/img?index=${indexNumber}" alt="Не найдено"></img>`; // TODO: "плохая"(?) константа
		
		localStorage.setItem(storeIndexNumberKey, indexNumber);
	};
	
	// isNext && nextIndex || prevewIndex;
	// Нормально ли брать indexNumber из замыкания или лучше как-то передавать?
	function addIndex(isNext){
		const borderSymbolIndex = isNext ? 0 : symbolsAxis.length - 1; // имя типа "символ следующей итерации" или хз. Не граничный, а следующий за граничным
	
		let indexNumberWasChanged = false;
		for (let i = indexNumber.length - 1; i >= 0; i--){
			let symbolIndex = symbolsAxis.indexOf(indexNumber[i]);
			const notBorderCase = isNext ? symbolIndex < symbolsAxis.length - 1 : symbolIndex > 0;
			const nextSymbolIndex = isNext ? symbolIndex + 1 : symbolIndex - 1;
			if (notBorderCase){
				indexNumber = indexNumber.substring(0, i) + symbolsAxis[nextSymbolIndex] + indexNumber.substring(i + 1);
				indexNumberWasChanged = true;
				break;
			} else {
				indexNumber = indexNumber.substring(0, i) + symbolsAxis[borderSymbolIndex] + indexNumber.substring(i + 1);
			}
		}
	
		if (!indexNumberWasChanged){
			// Есть ли практика лучше для такого случая?
			indexNumber = '';
			for (let i = 0; i < indexNumberLength; i++){
				indexNumber += symbolsAxis[borderSymbolIndex];
			}
		}
	};
	
	function saveImage(){
		// Есть ли практика лучше?
		const a = document.createElement('a');
		a.href = `/img?index=${indexNumber}`;
		a.download = `${indexNumber}.png`; // todo: откуда брать расширение?
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};
	
	function valueElementOnInputHandler() {
		indexNumber = this.value;
		reLoadImage();
	};
	
	// Наименования обработчиков нажатий - это хендлеры или пофиг?
	function randomizeBtnHandler(){
		indexNumber = '';
		for (let i = 0; i < indexNumberLength; i++){
			indexNumber += symbolsAxis.charAt(Math.floor(Math.random() * symbolsAxis.length))
		}
		
		reLoadImage();
	}
	
	// Есть ли смысл выносить в функцию?
	function initHandlers() {
		// Есть ли смысл выделять в отдельную функцию, не анонимную?
		document.getElementById('nextBtn').onclick = function(){
			addIndex(true);
			reLoadImage();
		};
		
		document.getElementById('saveBtn').onclick = saveImage;
		
		document.getElementById('previewBtn').onclick = function(){
			addIndex(false);
			reLoadImage();
		};
	
		document.getElementById('randomizeBtn').onclick = randomizeBtnHandler;
	
		valueElement.oninput = valueElementOnInputHandler;
	};
	
	initHandlers();
	reLoadImage();
};

fetch('/uiinfo', {
	method: 'GET'
})
.then(response => {
	return response.json();
})
.then(uiConfig => {
	initPage(uiConfig);
});