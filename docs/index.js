'use strict';

class Input
{
	constructor()
	{
		this.element = document.getElementById('input');
		this.faderDelay = 150;
		this.faderStep = .1;
		this.faderId = null;
		this.fading = 0;
		this.opacity = 1.0;
	}

	fader()
	{
		if (this.opacity <= 0)
		{
			// this.highlight('', '');
			return;
		}
		this.opacity = this.opacity - this.faderStep;
		if (this.opacity < 0) this.opacity = 0;

		let color = 'rgba(0,0,0,' + this.opacity + ')';

		if (this.fading & 0b001) this.first.style.color = color;
		if (this.fading & 0b010) this.second.style.color = color;
		if (this.fading & 0b100) this.third.style.color = color;

		this.faderId = setTimeout(this.fader.bind(this), this.faderDelay);
	}

	get first()
	{
		return this.element.children[0];
	}

	get second()
	{
		return this.element.children[1];
	}

	get third()
	{
		return this.element.children[2];
	}

	set first(dir)
	{
		this.first.textContent = dir;
		this.first.style.color = 'black';
		this.first.style.backgroundColor = '';
		this.first.style.borderColor = '';
		this.fading &= 0b110;
	}

	set second(dir)
	{
		this.second.textContent = dir;
		this.second.style.color = 'black';
		this.second.style.backgroundColor = '';
		this.second.style.borderColor = '';
		this.fading &= 0b101;
	}

	set third(dir)
	{
		this.third.textContent = dir;
		this.third.style.color = 'black';
		this.third.style.backgroundColor = '';
		this.third.style.borderColor = '';
		this.fading &= 0b011;
	}

	update()
	{
		// console.log(dirs.join(' '));
		if (dirs.length >= 1) this.first = dirs[0];
		if (dirs.length >= 2) this.second = dirs[1];
		if (dirs.length >= 3) this.third = dirs[2];
	}

	fade()
	{
		if (this.faderId) clearTimeout(this.faderId);
		this.fading = 0b111;
		this.opacity = 1.0;
		this.faderId = setTimeout(this.fader.bind(this), this.faderDelay);
	}

	highlight(bg, bc)
	{
		if (bg != null) {
			this.first.style.backgroundColor = bg;
			this.second.style.backgroundColor = bg;
			this.third.style.backgroundColor = bg;
		}

		if (bc != null)
		{
			this.first.style.borderColor = bc;
			this.second.style.borderColor= bc;
			this.third.style.borderColor= bc;
		}
	}
}

class Hideable
{
	constructor(element)
	{
		this.element = element;
	}

	toggle()
	{
		this.show(!this.showing);
	}

	show(on = true)
	{
		this.element.style.visibility = on ? 'initial' : 'hidden';
	}

	get showing()
	{
		return this.element.style.visibility != 'hidden';
	}
}

class Board extends Hideable
{
	constructor(element)
	{
		super(element);
	}

	highlight(area, color = null)
	{
		// for (let f = area.src.file; f <= area.dst.file; ++f)
		// for (let r = area.src.rank; r <= area.dst.rank; ++r)
		for (let s of area.squares)
		{
			// let square = this.element.querySelector('.' + Square.fr2s(f, r));
			let square = this.element.querySelector('.' + s.text);
			if (color)
				square.style.backgroundColor = color;
			else
				square.style.backgroundColor = s.light ? 'var(--light-square-color)' : 'var(--dark-square-color)';
		}
	}

	clear()
	{
		this.highlight(new Area(), null);
	}
}

class Square
{
	constructor(file, rank)
	{
		this.file = file
		this.rank = rank;
	}

	get color()
	{
		return (this.file + this.rank) % 2;
	}

	get dark()
	{
		return this.color == 0;
	}

	get light()
	{
		return this.color == 1;
	}

	get text()
	{
		return Square.fr2s(this.file, this.rank);
	}

	static fr2s(file, rank)
	{
		return ' abcdefgh'[file] + rank;
	}
}

class Area
{
	constructor(f1 = 1, r1 = 1, f2 = 8, r2 = 8)
	{
		this.src = new Square(f1, r1);
		this.dst = new Square(f2, r2);
	}

	get width()
	{
		return this.dst.file - this.src.file + 1;
	}

	get height()
	{
		return this.dst.rank - this.src.rank + 1;
	}

	north()
	{
		this.src.rank = this.src.rank + Math.floor((this.height + 1) / 2);
		return this;
	}

	south()
	{
		this.dst.rank = this.src.rank - 1 + Math.floor((this.height + 1) / 2);
		return this;
	}

	east()
	{
		this.src.file = this.src.file + Math.floor((this.width + 1) / 2);
		return this;
	}

	west()
	{
		this.dst.file = this.src.file - 1 + Math.floor((this.width + 1) / 2);
		return this;
	}

	cut(dirs)
	{
		for (let dir of dirs)
		{
			dir = dir2text(dir);
			if (dir[0] == 'n') this.north(); else
			if (dir[0] == 's') this.south();
			if (dir[1] == 'w') this.west(); else
			if (dir[1] == 'e') this.east();
		}
	}

	get squares()
	{
		let ss = [];
		for (let f = this.src.file; f <= this.dst.file; ++f)
		for (let r = this.src.rank; r <= this.dst.rank; ++r)
			ss.push(new Square(f, r));
		return ss;
	}

	get text()
	{
		return this.squares.map((s) => Square.fr2s(s.file, s.rank)).join(' ');
	}
}

function key2dir(k)
{
	if ('q4'.indexOf(k) >= 0) return '↖';
	if ('w5'.indexOf(k) >= 0) return '↗';
	if ('a1'.indexOf(k) >= 0) return '↙';
	if ('s2'.indexOf(k) >= 0) return '↘';
	return null;
}

function dir2text(d)
{
	if (d == '↖') return 'nw';
	if (d == '↗') return 'ne';
	if (d == '↙') return 'sw';
	if (d == '↘') return 'se';
	return d;
}

function getRandomSquare()
{
	let file = Math.round(Math.random() * 7) + 1;
	let rank = Math.round(Math.random() * 7) + 1;
	return [file, rank];
}

function setQuestion(file, rank)
{
	document.querySelector('#question').textContent = Square.fr2s(file, rank);
}

function setAnswer(text)
{
	document.querySelector('#answer').textContent = text;
}

function checkAnswer()
{
	let question = document.querySelector('#question').textContent;

	let area = new Area();
	area.cut(dirs);

	return question == area.text;
}

function onKeyDown(key)
{
	if (key == 'x')
	{
		toggleBoards();
		return;
	}

	let dir = key2dir(key);
	if (!dir)
	{
		dirs = [];
	}
	else
	{
		if (dirs.length < 3)
			dirs.push(dir);
		else
			dirs = [dir];

		input.update();

		if (checkAnswer())
		{
			input.highlight(null, 'lime');
			input.fade();

			let [file, rank] = getRandomSquare();
			setQuestion(file, rank);
		}
		else if (dirs.length >= 3)
		{
			input.highlight('crimson', '');
		}

		updateBoards();
	}
}

document.onkeydown = function(e)
{
	// console.log(e);
	onKeyDown(e.key);
}

let buttons = document.querySelectorAll('#controls > button');
buttons[0].onclick = function() { onKeyDown('q') };
buttons[1].onclick = function() { onKeyDown('w') };
buttons[2].onclick = function() { onKeyDown('a') };
buttons[3].onclick = function() { onKeyDown('s') };

let toggler = document.querySelector('#auxiliary > .board-toggler');
toggler.onclick = function() { onKeyDown('x') };

let dirs = [];
let input = new Input();
let board = new Board(document.getElementById('board'));
let [file, rank] = getRandomSquare();
setQuestion(file, rank);


class Button
{
	constructor(dir)
	{
		this.dir = dir;
		this.element = document.querySelector('.' + dir);
	}

	get bid()
	{
		return 'board-' + this.dir;
	}

	get boardVisible()
	{
		return this.element.firstChild.classList.contains('board');
	}

	showBoard()
	{
		this.element.firstChild.remove();

		let board = document.getElementById('board');
		board = board.cloneNode(true);
		board.id = this.bid;
		board.style.display = 'grid';
		board.style.width = '90%';
		board.style.margin = 'auto';

		this.element.appendChild(board);
		this.updateBoard();
	}

	hideBoard()
	{
		this.element.firstChild.remove();
		let arrow = document.createElement('div');
		arrow.classList.add('arrow');
		this.element.appendChild(arrow);
	}

	updateBoard()
	{
		let board = new Board(document.getElementById(this.bid));
		let area = new Area();

		board.highlight(area, null);

		let dd = dirs.length < 3 ? dirs.slice() : [ ];
		dd.push(this.dir)

		console.log(dd);
		area.cut(dd);

		board.highlight(area, 'lime');
	}
}

function toggleBoards()
{
	let nw = new Button('nw');
	let ne = new Button('ne');
	let sw = new Button('sw');
	let se = new Button('se');

	if (nw.boardVisible)
	{
		nw.hideBoard();
		ne.hideBoard();
		sw.hideBoard();
		se.hideBoard();
		toggler.style.backgroundColor = '';
	}
	else
	{
		nw.showBoard();
		ne.showBoard();
		sw.showBoard();
		se.showBoard();
		toggler.style.backgroundColor = 'lime';
	}
}

function updateBoards()
{
	let nw = new Button('nw');
	let ne = new Button('ne');
	let sw = new Button('sw');
	let se = new Button('se');

	if (nw.boardVisible)
	{
		nw.updateBoard();
		ne.updateBoard();
		sw.updateBoard();
		se.updateBoard();
	}
	else
	{
	}
}
