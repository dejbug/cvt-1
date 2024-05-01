
class Controls extends Hideable
{
	constructor(id)
	{
		super();
		this.element = document.getElementById(id || 'controls');
	}
}


class Problem
{
	constructor()
	{
		this.pieces = [];
		this.knight = null;
		this.targets = [];
		//this.reset();
	}

	reset()
	{
		this.pieces = Piece.randomposition('Nqrbnpppppppp');
		this.knight = this.pieces.find(p => p.chr === 'N');
		this.targets = Problem.targets(this.pieces, this.knight);
		console.assert(this.targets.length);
	}

	static targets(pieces, knight)
	{
		const attackedsquares = knightmoves(knight.square);
		const attackedpieceindices = Piece.piecesonsquares(pieces, attackedsquares);
		if (attackedpieceindices.length) return attackedpieceindices;

		const randomattackedsquaresindex = randint(attackedsquares.length);
		const randomattackedsquare = attackedsquares[randomattackedsquaresindex];
		const firstnonpawnindex = pieces.findIndex(p => p.chr !== 'N' && p.chr !== 'p');
		const firstnonpawn = pieces[firstnonpawnindex];
		firstnonpawn.square = randomattackedsquare;
		return [ firstnonpawnindex ];
	}

	takes(s)
	{
		//console.log(s.text, ':', this.targets.reduce((a, b) => a + ' ' + b.text, ''));
		return s.elementof(this.targets);
	}

	findtarget(s)
	{
		for (const i of this.targets)
			if (this.pieces[i].square.equals(s))
				return i;
		return -1;
	}

	// *targetedpieces()
	// {
	// 	for (const r of this.reachable)
	// 		yield this.pieces[r];
	// }

	get targetedpieces()
	{
		let pp = [];
		for (const i of this.targets)
			pp.push(this.pieces[i]);
		return pp;
	}

	get highestvaluedtarget()
	{
		if (this.targets.length)
			return this.targets.reduce(
				(a, b) => this.pieces[a].value < this.pieces[b].value ? b : a
			);
	}

	checkanswer(dirs)
	{
		console.assert(dirs instanceof Dirs);
		const squares = dirs.area.squares;
		console.assert(squares.length == 1);
		const s = squares[0];
		console.log('answer', s.text, dirs.text,
			'candidates:', this.targets.reduce(
				(a, b) => a + this.pieces[b].square.text + ' ', ''));

		const i = this.findtarget(s);
		if (i >= 0)
		{
			const t = this.pieces[i];
			console.log('target', t.type, t.square.text);
			const hi  = this.highestvaluedtarget;
			const h = this.pieces[hi];
			const val = h.value;
			console.log('highestvaluedtarget', h.value, h.type, h.square.text);
			return [ true, t.value == h.value ];
		}

		return [ false, false ];
	}
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

	update(dirs)
	{
		console.assert(dirs instanceof Dirs);
		// console.log(dirs.area);
		if (dirs.length >= 1) this.first = dirs.dirs[0];
		if (dirs.length >= 2) this.second = dirs.dirs[1];
		if (dirs.length >= 3) this.third = dirs.dirs[2];
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

document.onkeydown = function(e)
{
	onKeyDown(e.key);
}

function onKeyDown(key)
{
	// console.log(key, dirs.length);

	if (key === 'x')
	{
		shower.show();
		return;
	}

	if (key == 'z')
	{
		poseQuestion();
		return;
	}

	dirs.add(new Dir(key));
	input.update(dirs);

	if (dirs.ok)
	{
		const [ correct, highest ] = problem.checkanswer(dirs);
		if (correct)
		{
			console.log(highest ? 'CORRECT!' : 'correct!');
		}

		const area = dirs.pop();

		input.fade();
		input.highlight(null, 'crimson');
		// poseQuestion();

	}
}

class ArrayInput
{
	constructor()
	{
	}
}

class Trainer3
{
	constructor()
	{
		this.input = new ArrayInput();
	}
}



const dirs = new Dirs();

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
drawMainCross(board);

board.show(false);
// document.getElementById('controls').style.filter = 'opacity(.3)';

function poseQuestion()
{
	problem.reset();
	board.load(problem.pieces);
	shower.show();

	console.log('reachable pieces:');
	for (const p of problem.targetedpieces)
		console.info(p.chr, p.value, p.square.arrows);
}

poseQuestion();
