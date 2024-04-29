
class Square
{
	constructor(file, rank)
	{
		this.file = file ? file : Math.floor(Math.random() * 7) + 1;
		this.rank = rank ? rank : Math.floor(Math.random() * 7) + 1;
		console.assert(this.file >= 1 && this.file <= 8);
		console.assert(this.rank >= 1 && this.rank <= 8);
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
}


class Arrows
{
	// static GLYPHS = '↙↖↘↗';
	static DIRS = ['sw', 'nw', 'se', 'ne'];

	constructor(file, rank)
	{
		[this.a, this.b, this.c] = Arrows.qarrows(file, rank);
	}

	static cut(x)
	{
		let a = Math.floor(x / 5);
		let b = Math.floor((x - a * 4) / 3);
		let c = Math.floor((x - a * 4 - b * 2) / 2);
		return [a, b, c]
	}

	static qarrow(h, v)
	{
		// return Arrows.GLYPHS[(h << 1) + v];
		return Arrows.DIRS[(h << 1) + v];
	}

	static qarrows(f, r)
	{
		let [f1, f2, f3] = Arrows.cut(f);
		let [r1, r2, r3] = Arrows.cut(r);
		return [ Arrows.qarrow(f1, r1), Arrows.qarrow(f2, r2), Arrows.qarrow(f3, r3) ];
	}
}

class Question
{
	constructor(id)
	{
		this.element = document.getElementById(id);
	}

	set a(dir)
	{
		this.element.children[0].className = 'arrow ' + dir;
	}

	set b(dir)
	{
		this.element.children[1].className = 'arrow ' + dir;
	}

	set c(dir)
	{
		this.element.children[2].className = 'arrow ' + dir;
	}

	set(arrow)
	{
		this.a = arrow.a;
		this.b = arrow.b;
		this.c = arrow.c;
	}
}

function rook(origin)
{
	let ss = [];
	let s;
	for (let i = 1; i <= 8; ++i)
	{
		s = origin.move( 0,  i);
		if (s) ss.push(s);
		s = origin.move( i,  0);
		if (s) ss.push(s);
		s = origin.move( 0, -i);
		if (s) ss.push(s);
		s = origin.move(-i, 0);
		if (s) ss.push(s);
	}
	return ss;
}

function bishop(origin)
{
	let ss = [];
	let s;
	for (let i = 1; i <= 8; ++i)
	{
		s = origin.move( i,  i);
		if (s) ss.push(s);
		s = origin.move(-i,  i);
		if (s) ss.push(s);
		s = origin.move(-i, -i);
		if (s) ss.push(s);
		s = origin.move( i, -i);
		if (s) ss.push(s);
	}
	return ss;
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

function squares(excluded = [])
{
	let ss = [];
	let s;
	for (let file = 1; file <= 8; ++file)
		for (let rank = 1; rank <= 8; ++rank)
		{
			s = new Square(file, rank);
			if (!s.elementof(excluded))
				ss.push(s);
		}
	return ss;
}

function choose(x)
{
	if (typeof x == 'number')
		return Math.floor(Math.random() * x);
	let i = Math.floor(Math.random() * x.length);
	return x[i];
}

class Candidates
{
	static ROOK = 1;
	static BISHOP = 2;
	static KNIGHT = 3;
	static UNREACHABLE = 4;

	constructor(origin)
	{
		this.reset(origin);
	}

	reset(origin)
	{
		this.origin = origin || new Square();

		this.bb = bishop(this.origin);
		this.rr = rook(this.origin);
		this.nn = knight(this.origin);

		let excluded = this.bb.concat(this.rr).concat(this.nn);
		excluded.push(this.origin);
		this.uu = squares(excluded);

		this.type = null;
		this.target = null;
		this.shuffle();
	}

	shuffle()
	{
		this.type = this.randomtype;
		this.target = this.randomtarget;
	}

	get randomtype()
	{
		let i = Math.floor(Math.random() * 9);
		if (i == 0) return Candidates.UNREACHABLE;
		return Math.floor(Math.random() * 3) + 1;
	}

	get randomtarget()
	{
		if (this.type == Candidates.ROOK) return choose(this.rr);
		else if (this.type == Candidates.BISHOP) return choose(this.bb);
		else if (this.type == Candidates.KNIGHT) return choose(this.nn);
		return choose(this.uu);
	}
}


class Hideable
{
	toggle()
	{
		return this.show(!this.showing);
	}

	show(on = true)
	{
		if (!this.element) return false;
		this.element.style.visibility = on ? 'initial' : 'hidden';
		return on;
	}

	get showing()
	{
		if (!this.element) return false;
		return this.element.style.visibility != 'hidden';
	}
}


class Board extends Hideable
{
	constructor(id)
	{
		super();
		this.parent = document.getElementById(id);
		this.element = this.parent.firstChild;
	}

	reset()
	{
		if (!this.element)
		{
			this.element = Board.create();
			this.parent.appendChild(this.element);
			this.show(false);
		}
		else
			for (let child of this.element.children)
				child.className = '';
	}

	load(candidates)
	{
		this.reset();
		Board.populate(this.element, candidates);
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

	static populate(board, candidates)
	{
		board.children[candidates.origin.index].classList.add('origin');
		board.children[candidates.target.index].classList.add('target');
		for (let s of candidates.bb)
		{
			board.children[s.index].classList.add('dark');
			board.children[s.index].classList.add('bishop');
		}
		for (let s of candidates.rr)
		{
			board.children[s.index].classList.add('dark');
			board.children[s.index].classList.add('rook');
		}
		for (let s of candidates.nn)
		{
			board.children[s.index].classList.add('dark');
			board.children[s.index].classList.add('knight');
		}
		// for (let s of candidates.uu)
			// board.children[s.index].classList.add('nonsquare');
	}
}

function poseQuestion()
{
	candidates.reset();
	candidates.shuffle();

	let qsource = new Question('source');
	let qtarget = new Question('target');

	// console.log(candidates.type, candidates.target, candidates.target.arrows);
	qsource.set(candidates.origin.arrows);
	qtarget.set(candidates.target.arrows);

	// let board = createBoard(candidates);
	// document.getElementById('trainer').appendChild(board);

	board.load(candidates);

	return [ candidates, board ];
}

function setStatus(text)
{
	let element = document.getElementById('status');
	element.textContent = text;
	if (text)
	{
		element.style.backgroundColor = 'tomato';
		element.style.color = 'white';
	}
	else
	{
		element.style.backgroundColor = '';
		element.style.color = '';
	}
}

function updateBoardToggler(color = 'lime')
{
	buttons[4].style.backgroundColor = board.showing ? color : '';
}


document.onkeydown = function(e)
{
	onKeyDown(e.key);
}

let buttons = document.querySelectorAll('#controls > *');
buttons[0].onclick = function() { onKeyDown(1) };
buttons[1].onclick = function() { onKeyDown(2) };
buttons[2].onclick = function() { onKeyDown(3) };
buttons[3].onclick = function() { onKeyDown(4) };
buttons[4].onclick = function() { onKeyDown('x') };


let candidates = new Candidates();
let board = new Board('board');
let nextQuestionDelayTimerId = null;

poseQuestion();
// poseQuestion();

let ANSWER_KEYS = [
	'1', '2', '3', '4', 1, 2, 3, 4
];


function onKeyDown(key)
{
	// console.log(typeof key, typeof candidates.type);
	// console.log(key, candidates.type, key == candidates.type);

	if (key == 'x')
	{
		board.toggle();
		updateBoardToggler();
		return;
	}

	if (ANSWER_KEYS.indexOf(key) < 0) return;

	if (nextQuestionDelayTimerId != null)
	{
		clearTimeout(nextQuestionDelayTimerId);
		nextQuestionDelayTimerId = null;
	}

	if (key == candidates.type)
	{
		setStatus('');
		poseQuestion();
		board.show(false);
	}
	else
	{
		setStatus('error');
		board.show(true);
		nextQuestionDelayTimerId = setTimeout(
			function() { onKeyDown(candidates.type) },
			2000);
	}
	updateBoardToggler();
}
