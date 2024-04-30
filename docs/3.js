class Hideable
{
	constructor(hard = false, ekey)
	{
		this._ekey = ekey || 'element';
		this._skey = hard ? 'display' : 'visibility';
		this._off = hard ? 'none' : 'hidden';
		this._on = null;
	}

	toggle()
	{
		return this.show(!this.showing);
	}

	show(on = true)
	{
		const element = this[this._ekey];
		if (!element) return false;
		if (this._on === null)
			this._on = element.style[this._skey];
		element.style[this._skey] = on ? this._on : this._off;
		return on;
	}

	get showing()
	{
		const element = this[this._ekey];
		return element && element.style[this._skey] != this._off;
	}
}

class Controls extends Hideable
{
	constructor(id)
	{
		super();
		this.element = document.getElementById(id || 'controls');
	}
}

class Board extends Hideable
{
	constructor(id)
	{
		super(false, 'parent');
		this.parent = document.getElementById(id || 'board');
		this.element = this.parent.firstChild;
	}

	load(pieces)
	{
		this.reset();
		Board.populate(this.element, pieces);
	}

	reset()
	{
		if (!this.element)
		{
			this.element = Board.create();
			this.parent.appendChild(this.element);
			// this.show(false);
		}
		else
			for (let child of this.element.children)
				child.className = '';
	}

	static create()
	{
		let board = document.createElement('div');
		board.classList.add('board');
		for (let file = 1; file <= 8; ++file)
		for (let rank = 1; rank <= 8; ++rank)
		{
			let square = document.createElement('div');
			// square.style.border = 'thin solid black';
			let dark = (file + rank) % 2;
			square.style.backgroundColor = dark ? 'var(--dark-square-color)' : 'var(--light-square-color)';
			board.appendChild(square);
		}
		return board;
	}

	static populate(board, pieces)
	{
		for (let p of pieces)
			p.addclass(board.children[p.square.index]);
	}

	pieceAt(s)
	{
		const cc = this.element.children[s.index].classList;
		if (!cc.contains('icon')) return false;
		const dark = cc.contains('dark');
		if (cc.contains('king')) return new Piece(dark ? 'k' : 'K');
		if (cc.contains('queen')) return new Piece(dark ? 'q' : 'Q');
		if (cc.contains('rook')) return new Piece(dark ? 'r' : 'R');
		if (cc.contains('bishop')) return new Piece(dark ? 'b' : 'B');
		if (cc.contains('knight')) return new Piece(dark ? 'n' : 'N');
		if (cc.contains('pawn')) return new Piece(dark ? 'p' : 'P');
	}
}

class Square
{
	static NN = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8];

	constructor(file, rank)
	{
		// console.info(typeof file, file, typeof rank, rank);

		if (!file)
		{
			this.file = file ? file : Math.floor(Math.random() * 7) + 1;
			this.rank = rank ? rank : Math.floor(Math.random() * 7) + 1;
		}
		else
		{
			if (file !== 'number' || rank !== 'number')
				[file, rank] = Square.parse('' + file + rank);
			this.file = file ? file : Math.floor(Math.random() * 7) + 1;
			this.rank = rank ? rank : Math.floor(Math.random() * 7) + 1;
		}
		console.assert(this.file >= 1 && this.file <= 8);
		console.assert(this.rank >= 1 && this.rank <= 8);
	}

	static parse(text)
	{
		let f = 'abcdefghABCDEFGH12345678'.indexOf(text[0]);
		let r = '12345678'.indexOf(text[1]);
		f = f < 0 ? 0 : Square.NN[f];
		r = r < 0 ? 0 : Square.NN[r];
		// console.log('parsed', f, r);
		return [f, r];
	}

	static valid(file, rank)
	{
		return file >= 1 && file <= 8 && rank >= 1 && rank <= 8;
	}

	move(dfile, drank)
	{
		let file = this.file + dfile;
		let rank = this.rank + drank;
		if (Square.valid(file, rank))
			return new Square(file, rank)
	}

	get index()
	{
		return (this.file - 1) + ((8 - this.rank) << 3);
	}

	get arrows()
	{
		return new Arrows(this.file, this.rank);
	}

	get text()
	{
		return 'abcdefgh'[this.file - 1] + this.rank;
	}

	elementof(ss)
	{
		return ss.find(s => s.file == this.file && s.rank == this.rank);
	}

	static compare(a, b)
	{
		return a.file == b.file ? a.rank - b.rank : a.file - b.file;
	}

	equals(that)
	{
		return Square.compare(this, that) == 0;
	}
}

function test_Square_parse()
{
	let pieces = [
		new Piece('k', new Square('e8')),
		new Piece('k', new Square('12')),
		new Piece('k', new Square('d', 4)),
		new Piece('k', new Square('d', '4')),
		new Piece('K', new Square('d', 'x')),
		new Piece('K', new Square('d')),
		new Piece('K', new Square('xx')),
		new Piece('K', new Square()),
		new Piece('k', new Square(5, 1))
	];
	let board = new Board();
	board.load(pieces);
}

class Piece
{
	constructor(chr, square)
	{
		console.assert('kqrbnpKQRBNP'.includes(chr), `invalid piece char "${chr}"`);
		this._chr = chr;
		this.type = chr.toLowerCase();
		this.dark = 'kqrbnp'.includes(chr);

		this.square = square;
	}

	get chr() { return this._chr }

	get black() { return this.dark }

	get color() { return this.dark ? 'b' : 'w' }

	get white() { return !this.dark }

	get value() { return Piece.value(this.type) }

	static value(type)
	{
		if (type) switch (type)
		{
			case 'k': return 100;
			case 'q': return 9;
			case 'r': return 5;
			case 'b': return 3;
			case 'n': return 3;
			case 'p': return 1;
		}
		return 0;
	}

	get name()
	{
		if (!this.type) return '';
		switch (this.type)
		{
			case 'k': return 'king';
			case 'q': return 'queen';
			case 'r': return 'rook';
			case 'b': return 'bishop';
			case 'n': return 'knight';
			case 'p': return 'pawn';
		}
	}

	addclass(element)
	{
		element.classList.add('icon');
		element.classList.add(this.name);
		if (this.dark) element.classList.add('dark');
	}

	static piecesonsquares(pieces, squares)
	{
		let ii = [];
		// console.log(pieces, squares, pieces.filter(p => p.square.elementof(squares)));
		// const squares = movemethod(this.square);
		// return pieces.filter(p => p.square.elementof(squares));
		for (let i = 0; i < pieces.length; ++i)
			if (pieces[i].square.elementof(squares))
				ii.push(i);
		return ii;
	}
}

function randint(max)
{
	return Math.floor(Math.random() * max);
}

function randrange(min, max)
{
	return Math.floor(Math.random() * (max - min)) + min;
}

function popi(xx, i)
{
	return xx.slice(0, i).concat(xx.slice(i + 1,))
}

function randpop(xx)
{
	let i = randint(xx.length);
	return [ xx[i], popi(xx, i) ];
}

class Problem
{
	constructor()
	{
		this.pieces = [];
		this.knight = null;
		this.targets = [];
		this.reset();
	}

	reset()
	{
		this.pieces = makeRandomPosition('Nqrbnpppppppp');
		this.knight = this.pieces.find(p => p.chr === 'N');
		this.targets = knight(this.knight.square);
		this.correct();
		this.reachable = Piece.piecesonsquares(this.pieces, this.targets);
		//console.log('reachable', this.reachable);
	}

	takes(s)
	{
		//console.log(s.text, ':', this.targets.reduce((a, b) => a + ' ' + b.text, ''));
		return s.elementof(this.targets);
	}

	findtarget(s)
	{
		for (const i in this.targets)
			if (this.targets[i].equals(s))
				return i;
		return -1;
	}

	get highestvaluedtarget()
	{
		let best = 0;
		for (let i = 1; i < this.targets.length; ++i)
			if (this.targets[best].value < this.targets[i].value)
				best = i;
		return best;
	}

	get firsttarget()
	{
		console.assert(this.targets);
		return this.pieces.find(p => p.square.elementof(this.targets));
	}

	get firstnonpawn()
	{
		console.assert(this.pieces);
		return this.pieces.find(p => p.chr !== 'N' && p.chr !== 'p');
	}

	get randomtarget()
	{
		console.assert(this.targets);
		const i = randint(this.targets.length);
		return this.targets[i];
	}

	correct()
	{
		console.assert(this.knight);
		if (!this.firsttarget)
		{
			const p = this.firstnonpawn;
			console.assert(p);
			const s = this.randomtarget;
			// console.log('correcting', p.square.text, 'to', s.text);
			p.square = s;
		}
	}

	check(dirs)
	{
		const area = new Area();
		area.cut(dirs);
		console.assert(area.squares.length == 1);
		const a = area.squares[0];
		// console.log(dirs, a.text);

		const ti = this.findtarget(a);
		console.log(ti, this.reachable);

		if (ti >= 0)
		{
			const hi = this.highestvaluedtarget;
			const t = this.targets[ti];
			console.log(a.text, t.text);
			return a.equals(t);
		}

	}
}

function makeRandomPosition(cc)
{
	if (!cc) cc = 'kqrbnpKQRBNP';
	const cclen = cc.length;

	let ss = [];
	let pp = [];

	let c;
	for (let i = 0; i < cclen; ++i)
	{
		[c, cc] = randpop(cc);
		let n = null;
		let s = null;
		while (1)
		{
			s = new Square();
			if (s.elementof(ss)) continue;
			ss.push(s);
			break;
		}
		pp.push(new Piece(c, s));
	}
	console.assert(pp.length == cclen);
	return pp;
}

DKNIGHT = [[-2, -1], [-2, 1], [-1, 2], [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2]];

function knight(origin)
{
	let ss = [];
	for (let [f, r] of DKNIGHT)
	{
		if (Square.valid(origin.file + f, origin.rank + r))
			ss.push(new Square(origin.file + f, origin.rank + r));
	}
	return ss;
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
			const text = dir.text;
			if (text[0] == 'n') this.north(); else
			if (text[0] == 's') this.south();
			if (text[1] == 'w') this.west(); else
			if (text[1] == 'e') this.east();
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
}

class Dir
{
	constructor(key)
	{
		this.dir = Dir.key2dir(key);
	}

	get ok() { return typeof this.dir === 'string' }

	get arrow() { return this.dir }

	get text() { return Dir.dir2text(this.dir) }

	static key2dir(key)
	{
		if ('↖q4'.indexOf(key) >= 0) return '↖';
		if ('↗w5'.indexOf(key) >= 0) return '↗';
		if ('↙a1'.indexOf(key) >= 0) return '↙';
		if ('↘s2'.indexOf(key) >= 0) return '↘';
	}

	static dir2text(d)
	{
		if (d == '↖') return 'nw';
		if (d == '↗') return 'ne';
		if (d == '↙') return 'sw';
		if (d == '↘') return 'se';
		return d;
	}
}

document.onkeydown = function(e)
{
	onKeyDown(e.key);
}

class Shower
{
	constructor(delay)
	{
		this.timer = null;
		this.delay = delay || 1000;
	}

	show()
	{
		if (this.timer) return;
		board.show();
		controls.show(false);
		this.timer = setTimeout(this.hide.bind(this), this.delay);
	}

	hide()
	{
		board.show(false);
		controls.show();
		clearTimeout(this.timer);
		this.timer = null;
	}
}

function which(c)
{
	for (let i = 1; i < arguments.length; ++i)
		if (arguments[i].includes(arguments[0][0]))
			return i;
	return 0;
}

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
		this.first.textContent = dir.arrow;
		this.first.style.color = 'black';
		this.first.style.backgroundColor = '';
		this.first.style.borderColor = '';
		this.fading &= 0b110;
	}

	set second(dir)
	{
		this.second.textContent = dir.arrow;
		this.second.style.color = 'black';
		this.second.style.backgroundColor = '';
		this.second.style.borderColor = '';
		this.fading &= 0b101;
	}

	set third(dir)
	{
		this.third.textContent = dir.arrow;
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

function onKeyDown(key)
{
	// console.log(key);

	if (key === 'x')
	{
		shower.show();
		return;
	}

	const dir = new Dir(key);

	if (dir.ok)
	{
		dirs.push(dir);
		input.update();
		if (dirs.length >= 3)
		{
			if (problem.check(dirs))
			{
				console.log('correct!');
			}

			dirs = [];
			input.fade();
			input.highlight(null, 'crimson');
			// poseQuestion();
		}
	}
}


let dirs = [];

const board = new Board();
const controls = new Controls();
const input = new Input();
const shower = new Shower(600);
const problem = new Problem();

const buttons = document.querySelectorAll('#controls > button');
buttons[0].onclick = function() { onKeyDown('q') };
buttons[1].onclick = function() { onKeyDown('w') };
buttons[2].onclick = function() { onKeyDown('a') };
buttons[3].onclick = function() { onKeyDown('s') };
buttons[4].onclick = function() { onKeyDown('x') };

controls.show();
board.reset();

board.show(false);
// document.getElementById('controls').style.filter = 'opacity(.3)';

for (let f = 0; f < 8; ++f)
{
	const r = 4 << 3;
	let c = board.element.children[r + f];
	c.style.borderTop = 'thin solid black';
}
for (let r = 0; r < 8; ++r)
{
	let c = board.element.children[(r << 3) + 3];
	c.style.borderRight = 'thin solid black';
}

function poseQuestion()
{
	problem.reset();
	board.load(problem.pieces);
	shower.show();
}

poseQuestion();
