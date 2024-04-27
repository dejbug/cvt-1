def iter_squares():
	# for file in 'abcdefgh':
	for file in range(1, 9):
		for rank in range(1, 9):
			yield file, rank



for file, rank in sorted(iter_squares(), key = lambda x: (8 - x[1], x[0])):
	color = '--light-square-color' if (file + rank) % 2 else '--dark-square-color'
	square = ' abcdefgh'[file] + str(rank)
	print(f'''\
.{square} {{
	grid-area: {square};
	background-color: var({color});
}}
''')
