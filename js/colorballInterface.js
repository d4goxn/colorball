/*global document:false window:false Stats:false console:false*/

// @author: Dan Ross / http://abstractgoo.rs.af.cm/
define(function(require) {
	'use strict';

	var THREE = require('three');
	require('trackballControls');
	require('axisHelper');
	require('stats');

	var Plane = require('plane'),
		Colorball = require('colorball');

	return function() {
		var scene, camera, renderer, controls, stats;

		function init() {
			initEnvironment();
			initWorld();
			initObjects();
		}

		function initEnvironment() {
			stats = new Stats();

			renderer = new THREE.WebGLRenderer({
				antialias: true
			});
			renderer.setSize(window.innerWidth, window.innerHeight);

			document.body.appendChild(renderer.domElement);
			stats.domElement.id = 'stats-widget';
			document.body.appendChild(stats.domElement);
		}

		function initWorld() {
			camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
			camera.position.set(4, -3, 2).multiplyScalar(100);
			camera.up = new THREE.Vector3(0, 0, 1);
			camera.lookAt(new THREE.Vector3(0, 0, 0));

			scene = new THREE.Scene();
			scene.add(new THREE.AmbientLight(0xffffff));

			controls = new THREE.TrackballControls(camera, renderer.domElement);
			controls.noPan = controls.noZoom = true;
		}

		function initObjects() {

			var axisHelper = new THREE.AxisHelper(100);
			axisHelper.position.x = -300;
			axisHelper.position.y = -300;
			scene.add(axisHelper);
			window.axisHelper = axisHelper;

			var cameraPlane = new Plane(new THREE.PlaneGeometry(800, 800, 4, 4));
			scene.add(cameraPlane);
			window.plane = cameraPlane;

			initReferenceGrid();

			var sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 300);
			var subdivisions = 3;

			var colorball = new Colorball(sphere, subdivisions);
			scene.add(colorball.mesh);

			var dummyPlane = new THREE.Plane(
				(new THREE.Vector3(0, 0, 1)).normalize(),
				50
			);

			controls.addEventListener('change', function() {
				//cameraPlane.lookAt(camera.position);
				//colorball.bisectAlongPlane(cameraPlane.plane);
				colorball.bisectAlongPlane(dummyPlane);
			});
		}

		function startAnimation() {
			function animate() {
				window.setTimeout(function() {
					window.requestAnimationFrame(animate);
				}, 1000 / 60);

				controls.update();
				renderer.render(scene, camera);
				stats.update();
			}
			animate();
		}

		function initReferenceGrid() {
			var referenceMesh = new THREE.Mesh(
				new THREE.PlaneGeometry(2000, 2000, 10, 10),
				new THREE.MeshBasicMaterial({
					color: 0x333333,
					wireframe: true,
					transparent: true,
					opacity: 0.05
				})
			);

			scene.add(referenceMesh);
		}

		init();
		startAnimation();
	};
});
