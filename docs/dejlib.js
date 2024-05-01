
class Dir
{
	constructor(key)
	{
		this.dir = Dir.key2dir(key);
		console.assert(this.dir);
	}

	get ok() { return '↖↗↙↘'.includes(this.dir) }

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


class Dirs
{
	constructor()
	{
		this.dirs = [];
	}

	add(dir)
	{
		console.assert(dir instanceof Dir);
		if (dir.ok) this.dirs.push(dir);
		return this.ok;
	}

	get length() { return this.dirs.length }

	get ok() { return this.length >= 3 }

	get area() { if (this.ok) return Area.fromdirs(this) }

	// get text() { return this.dirs.join(' ') }
	get text() { return this.dirs.reduce((a, b) => a + b.dir, '') }

	pop()
	{
		if (this.ok)
		{
			const area = this.area;
			this.dirs = this.dirs.slice(3);
			return area;
		}
	}
}


/// TODO: Add confusion elements to preclude inferential learning.
///		For example, when using only diagonal arrows, the color of
///		can be derived from the shape (slash or backslash) of the
///		third arrow. We should add horizontal arrows and a glyph
///		for the (extended) center then randomly decide which notation
///		to use at each cut.
class Arrows
{
	static arrows(file, rank)
	{
		const [h1, h2, h3] = Arrows.cut(file);
		const [v1, v2, v3] = Arrows.cut(rank);
		return Arrows.arrow(h1, v1) + Arrows.arrow(h2, v2) + Arrows.arrow(h3, v3);
	}

	static square(arrows)
	{
		throw Error('not yet implemented');
	}

	static dirs(file, rank)
	{
		const [h1, h2, h3] = Arrows.cut(file);
		const [v1, v2, v3] = Arrows.cut(rank);
		return Arrows.arrow(h1, v1) + Arrows.arrow(h2, v2) + Arrows.arrow(h3, v3);
	}

	static ARROWS = '↙↖↘↗';
	static DIRS = ['sw', 'nw', 'se', 'ne'];

	static cut(x)
	{
		let a = Math.floor(x / 5);
		let b = Math.floor((x - a * 4) / 3);
		let c = Math.floor((x - a * 4 - b * 2) / 2);
		return [a, b, c]
	}

	static arrow(h, v)
	{
		return Arrows.ARROWS[(h << 1) + v];
	}

	static dir(h, v)
	{
		return Arrows.DIRS[(h << 1) + v];
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

	static fromdirs(dirs)
	{
		console.assert(dirs instanceof Dirs);
		const area = new Area();
		return area.cut(dirs.dirs);
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
		for (const dir of dirs.slice(0, 3))
		{
			const text = dir.text;
			if (text[0] == 'n') this.north(); else
			if (text[0] == 's') this.south();
			if (text[1] == 'w') this.west(); else
			if (text[1] == 'e') this.east();
		}
		return this;
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







function which(c)
{
	for (let i = 1; i < arguments.length; ++i)
		if (arguments[i].includes(arguments[0][0]))
			return i;
	return 0;
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

const DKNIGHT = [[-2, -1], [-2, 1], [-1, 2], [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2]];

function knightmoves(origin)
{
	let ss = [];
	for (let [f, r] of DKNIGHT)
	{
		if (Square.valid(origin.file + f, origin.rank + r))
			ss.push(new Square(origin.file + f, origin.rank + r));
	}
	return ss;
}


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
		return Arrows.arrows(this.file, this.rank);
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
		// return Square.compare(this, that) == 0;
		return this.file == that.file && this.rank == that.rank;
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

	static randomposition(cc)
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



function drawMainCross(board, border)
{
	console.assert(board instanceof Board);
	if (!border) border = 'thin solid black';
	for (let f = 0; f < 8; ++f)
	{
		const r = 4 << 3;
		let c = board.element.children[r + f];
		c.style.borderTop = border;
	}
	for (let r = 0; r < 8; ++r)
	{
		let c = board.element.children[(r << 3) + 3];
		c.style.borderRight = border;
	}
}
