require.config({
	paths: {
		three: 'lib/three.js/build/three',
		trackballControls: 'lib/three.js/examples/js/controls/TrackballControls',
		axisHelper: 'lib/three.js/src/extras/helpers/AxisHelper',
		stats: 'lib/three.js/examples/js/libs/stats.min'
	},
	shim: {
		three: {
			exports: 'THREE'
		},
		trackballControls: ['three'],
		axisHelper: ['three'],
		stats: ['three']
	}
});

/*
require(['three', 'axisHelper'], function(THREE, AxisHelper) {
	console.log('running');
	console.log(THREE);
	console.log(THREE.AxisHelper);
});
*/

require(['colorball'], function(colorball) {
	colorball();
});
