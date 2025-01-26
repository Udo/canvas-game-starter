ScreenUI = {

	screens : {},

	update_interval : 200,

	html_escape : (s) => { if(typeof s == 'undefined') s = ''; return((''+s).replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')); },

	default_target : 'dscreen',

	window_template : false,

	create_window : (_name, prop = false, content_prop = false) => {
		if(!prop) prop = {};
		prop.id = 'screen_'+_name;
		//ScreenUI.close_window(_name);
		$('#'+prop.id).remove();
		$(document.body).append(ScreenUI.window_template(prop));
		ScreenUI.load(_name, 'screen_'+_name+'_content', content_prop);
		setTimeout(() => {
			$('#'+prop.id)
				.css('transform', 'rotate3d(0,0,0,0deg)')
				.css('opacity', 1.0);
			if(prop.position == 'middle') $('#'+prop.id)
				.css('top', 0.5*($(window).height()-$('#screen_'+_name).height())+'px');
		}, 50);
	},

	close_window : (_name) => {
		$('#screen_'+_name).css('opacity', 0);
	},

	load : (name, to_element_id = false, prop = false) => {
		if(!to_element_id) to_element_id = ScreenUI.default_target;
		Game.state.current_screen = name;
		Game.state.current_screen_element_id = to_element_id;
		if(!prop) prop = Game.state;
		if(ScreenUI.screens[name]) {
			$('#'+to_element_id).html(ScreenUI.screens[name](prop));
		} else {
			$.get('screens/'+name+'.html?v='+Math.random(), (data) => {
				var tmpl = Macrobars.compile(data);
				ScreenUI.screens[name] = tmpl;
				$('#'+to_element_id).html(tmpl(prop));
			});
		}
	},

	refresh : () => {
		if(Game.state.pause) return;
		// refresh current dynamic screen
		ScreenUI.load_screen(Game.state.current_screen, Game.state.current_screen_element_id);
	},

	init : () => {
		ScreenUI.window_template = Macrobars.compile($('#window-template').html());
		setInterval(ScreenUI.update, ScreenUI.update_interval);
		return true;
	},

	update : () => {
		if(Game.state.pause) return;
		// to do: refresh other UI
	},

}

