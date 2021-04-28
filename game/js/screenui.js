ScreenUI = {

	screens : {},
	
	update_interval : 200,

	load_screen : (name, override_cache = true) => {
		Game.state.sp = 0;
		var sclist = $('.generic-list');
		if(sclist.length > 0) {
			Game.state.sp = sclist.scrollTop();
		}

		if(override_cache)
			ScreenUI.screens[name] = false;
		ScreenUI.screen_update_hook = false;
		Game.state.current_screen = name;
		$('.sbtn').removeClass('active');
		try {
			$('.sbtn-'+name).addClass('active');
		} catch(ee) {}
		if(ScreenUI.screens[name]) {
			$('#dscreen').html(ScreenUI.screens[name](Game.state));
		} else {
			$.get('screens/'+name+'.html?v='+Math.random(), (data) => {
				var tmpl = Macrobars.compile(data);
				ScreenUI.screens[name] = tmpl;
				$('#dscreen').html(tmpl(Game.state));
			});
		}
		$('.generic-list').scrollTop(Game.state.sp);
	},

	templates : {},

	refresh : () => {
		if(Game.state.pause) return;
		ScreenUI.load_screen(Game.state.current_screen, false);
		ScreenUI.update();
	},

	init : () => {
		ScreenUI.templates.titlebar = Macrobars.compile($('#t-titlebar').html());
		setInterval(ScreenUI.update, ScreenUI.update_interval);
	},

	screen_update_hook : false,

	diff_update : (element, new_content) => {
		var old_html = element.html().replace(/\W/g, '');
		var new_html = new_content.replace(/\W/g, '');
		if(old_html != new_html) {
			element.html(new_content);
		}
	},

	update : () => {
		if(Game.state.pause) return;
		ScreenUI.diff_update($('nav'), ScreenUI.templates.titlebar(Game.state));
		if(ScreenUI.screen_update_hook)
			ScreenUI.screen_update_hook();
	},

}

