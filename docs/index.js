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

		if (color)
		{
			let [ hh, vv ] = area.cross;
			this.drawBorder(hh, 'borderTop', 'thin solid lime');
			this.drawBorder(vv, 'borderRight', 'thin solid lime');

			let [ ll, rr, tt, bb ] = area.box;
			this.drawBorder(ll, 'borderLeft', 'thin solid lime');
			this.drawBorder(rr, 'borderRight', 'thin solid lime');
			this.drawBorder(tt, 'borderTop', 'thin solid lime');
			this.drawBorder(bb, 'borderBottom', 'thin solid lime');
		}
		else
			this.clearBorders();
	}

	drawBorder(ss, key, value)
	{
		for (let s of ss)
		{
			let el = this.element.querySelector('.' + s.text);
			el.style[key] = value;
		}
	}

	clearBorders()
	{
		for (let file = 1; file <= 8; ++file)
			for (let rank = 1; rank <= 8; ++rank)
			{
				let s = new Square(file, rank);
				let el  = this.element.querySelector('.' + s.text);
				el.style.border = '';
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

	move(dfile, drank)
	{
		let file = this.file + dfile;
		let rank = this.rank + drank;
		if (file < 1 || file > 8) return null;
		if (rank < 1 || rank > 8) return null;
		return new Square(file, rank);
	}
}

class Area
{
	constructor(f1 = 1, r1 = 1, f2 = 8, r2 = 8)
	{
		if (f1 > f2) [ f1, f2 ] = [ f2, f1 ];
		if (r1 > r2) [ r1, r2 ] = [ r2, r1 ];
		this.src = new Square(f1, r1);
		this.dst = new Square(f2, r2);
		this.history = [];
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
		this.history.push('n');
		return this;
	}

	south()
	{
		this.dst.rank = this.src.rank - 1 + Math.floor((this.height + 1) / 2);
		this.history.push('s');
		return this;
	}

	east()
	{
		this.src.file = this.src.file + Math.floor((this.width + 1) / 2);
		this.history.push('e');
		return this;
	}

	west()
	{
		this.dst.file = this.src.file - 1 + Math.floor((this.width + 1) / 2);
		this.history.push('w');
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

	get width()
	{
		return this.dst.file - this.src.file + 1;
	}

	get height()
	{
		return this.dst.rank - this.src.rank + 1;
	}

	get text()
	{
		return this.squares.map((s) => Square.fr2s(s.file, s.rank)).join(' ');
	}

	static File(file)
	{
		let ss = [];
		for (let rank = 1; rank <= 8; ++rank)
			ss.push(new Square(file, rank));
		return ss;
	}

	static Rank(rank)
	{
		let ss = [];
		for (let file = 1; file <= 8; ++file)
			ss.push(new Square(file, rank));
		return ss;
	}

	isnormal()
	{
		// True if this Area was cut by nw, ne, se, sw. That is,
		//	if the history contains matched pairs of one vertical
		//	and one horizontal cut.
		if (this.history.length <= 0) return true;
		if (this.history.length % 2) return false;
		for (let i = 0; i < this.history.length; i += 2)
		{
			let a = this.history[i];
			let b = this.history[i + 1];
			if ((a == 'n' || a == 's') && (b == 'w' || b == 'e')) continue;
			if ((a == 'w' || a == 'e') && (b == 'n' || b == 's')) continue;
			return false;
		}
		return true;
	}

	get mid()
	{
		console.assert(this.isnormal);

		//console.log(this.width, this.src.file, this.src.rank);

		if (this.width == 4)
			return new Square(4, 4);
		else if (this.width == 2)
		{
			if (this.src.file <= 4 && this.src.rank >= 5)
				return new Square(2, 6);
			if (this.src.file >= 5 && this.src.rank >= 5)
				return new Square(6, 6);
			if (this.src.file <= 4 && this.src.rank <= 4)
				return new Square(2, 2);
			if (this.src.file >= 5 && this.src.rank <= 4)
				return new Square(6, 2);
		}
		else if (this.width == 1)
		{
			let file, rank;
			if (this.src.file <= 2) file = 1;
			else if (this.src.file <= 4) file = 3;
			else if (this.src.file <= 6) file = 5;
			else file = 7;
			if (this.src.rank <= 2) rank = 1;
			else if (this.src.rank <= 4) rank = 3;
			else if (this.src.rank <= 6) rank = 5;
			else rank = 7;
			return new Square(file, rank);
		}
		return null;
	}

	get cross()
	{
		let mid = this.mid;
		if (!mid) return [ [], [] ];

		let hh = [ mid ], vv = [ mid ];
		let len = this.width;

		for (let i = 1; i < len; ++i)
		{
			hh.push(mid.move(-i, 0));
			vv.push(mid.move(0, -i));
		}
		for (let i = 1; i <= len; ++i)
		{
			hh.push(mid.move(i, 0));
			vv.push(mid.move(0, i));
		}
		return [ hh, vv ];
	}

	get box()
	{
		let mid = this.mid;
		let len = this.width;

		let f1 = mid.file - len + 1
		let f2 = mid.file + len;
		let r1 = mid.rank - len + 1;
		let r2 = mid.rank + len;

		let ll = [], rr = [], tt = [], bb = [];

		for (let r = r1; r <= r2; ++r)
		{
			ll.push(new Square(f1, r));
			rr.push(new Square(f2, r));
		}
		for (let f = f1; f <= f2; ++f)
		{
			bb.push(new Square(f, r1));
			tt.push(new Square(f, r2));
		}

		return [ ll, rr, tt, bb ];
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

		// console.log(dd);
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
