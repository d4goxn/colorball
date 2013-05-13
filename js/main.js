require.config({
	shim: {
		threejs: {
			exports: 'THREE'
		},
		TrackballControls: {
			deps: ['threejs'],
			exports: 'TrackballControlls'
		}
	}
});
