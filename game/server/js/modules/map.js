var Levels = {

	l0 : {
		lines : [
			'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
			'X                                 X',
			'X          X                      X',
			'X      X   X                      X',
			'X      X   X    XXX XXX           X',
			'X          X    X     X           X',
			'X        XXXXX  X     X           X',
			'X               X     X           X',
			'X   XXXX   X    XXX XXX           X',
			'X   X      X                      X',
			'X   X      X                      X',
			'X   X      X                 S    X',
			'X                                 X',
			'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		],
	},

}

function def_instantiate(def) {
	def.plan = {};
	def.spawnpoints = [];
	let line_idx = -1;
	def.x_max = 0;
	def.y_max = 0;
	def.lines.forEach(line => {
		line_idx += 1;
		if(line_idx > def.y_max)
			def.y_max = line_idx;
		let col_idx = -1;
		for(let char of line) {
			col_idx += 1;
			if(col_idx > def.x_max)
				def.x_max = col_idx;
			let cell = {};
			switch (char)
			{
				case 'X':
					cell.type = 1;
					break;
				case 'S':
					def.spawnpoints.push([col_idx, line_idx]);
					break;
				default:
					cell.type = 0;
			}

			def.plan[col_idx+':'+line_idx] = cell;
		}
	});
}

var Map = {

	get : (ws) => {
		return Levels.l0;
	},

};

def_instantiate(Levels.l0);

module.exports = Map;
