/*global THREE:false Stats:false requestAnimationFrame:false document:false window:false*/

// @author: Dan Ross / http://abstractgoo.rs.af.cm/
(function() {
	"use strict";

	var faceIndices = ['a', 'b', 'c', 'd'];

	function colorVerticesBySphericalCoordinates(geometry, radius) {
		/*
		Hue = latitude
		Saturation = distance from polar axis, proportional to radius
		Luminance = longitude
		*/
		var invPI = 1 / Math.PI;
		var invRadius = 1 / radius;

		for(var i = 0; i < geometry.faces.length; i++) {
			var face = geometry.faces[i];
			var vertices = (face instanceof THREE.Face3)? 3: 4;

			for(var v = 0; v < vertices; v++) {
				var vertexIndex = face[faceIndices[v]];
				var vertex = geometry.vertices[vertexIndex];

				var longitude = Math.atan2(vertex.x, vertex.z);
				var latitude = Math.acos(vertex.y * invRadius);
				var distanceFromCenter = Math.sqrt(Math.pow(vertex.x, 2) + Math.pow(vertex.z, 2));

				var color = new THREE.Color(0xfff000);
				var H = ((longitude * invPI) + 1) / 2;
				var S = distanceFromCenter * invRadius;
				var L = (-1) * (latitude * invPI) + 1;

				color.setHSL(H, S, L);

				face.vertexColors[v] = color;
			}
		}
	}

	function bisectAlongPlane(geometry, plane, sphere) {
		/*
		geometry: A THREE.Geometry that will be cut.
		plane: {
			center: THREE.Vector3
			normal: THREE.Vector3
		}
		The coordinates of the plane must be in the same space as geometry.vertices.
		*/
		
		var i;
		var vertex;
		var upperVertices = []; // I wish this was a set.

		for(i = 0; i < geometry.vertices.length; i++) {
			vertex = geometry.vertices[i];
			if(plane.distanceToPoint(vertex) >= 0)
				upperVertices.push(vertex);
		}

		var remainingFaces = [];
		var intersectingEdges = [];
		for(i = 0; i < geometry.faces.length; i++) {
			var face = geometry.faces[i];
			var verticesPerFace = (face instanceof THREE.Face3)? 3: 4;
			var isFaceAbovePlane = true;

			// Two birds with one stone: Find faces to remove and find edges that intersect the plane.
			var lastVertex;
			var isLastVertexAbovePlane;
			for(var j = 0; j < verticesPerFace; j++) {
				vertex = geometry.vertices[face[faceIndices[j]]];
				if(plane.distanceToPoint(vertex) >= 0) {
					isLastVertexAbovePlane = true;
				} else {
					if(isLastVertexAbovePlane)
							intersectingEdges.push([lastVertex, vertex]);
						isLastVertexAbovePlane = false;
						isFaceAbovePlane = false;
					}
					lastVertex = vertex;
				} 

				if(!isFaceAbovePlane)
					remainingFaces.push(face);
			}
			geometry.faces = remainingFaces;

			// Move points that are on the wrong side of the plane to the intersection of the sphere and the plane, moving through a plane described by a point, the vertex, and by a line, oriented along the normal of the intersecting plane, that runs through the center of the sphere. Remember cross product. 
			intersectingEdges.forEach(function(edge) {
			var stationaryPoint, moveablePoint;
			if(plane.distanceToPoint(edge[0]) >= 0) {
				moveablePoint = edge[0];
				stationaryPoint = edge[1];
			} else {
				moveablePoint = edge[1];
				stationaryPoint = edge[0];
			}

			//moveVertexToPlane(moveablePoint, plane, sphere);
			// create a translation plane from the center of the sphere and the edge
			var translationPlane = new THREE.Plane();
			translationPlane.setFromCoplanarPoints(sphere.center, moveablePoint, stationaryPoint);

			// find the intersection line between the translation plane and the bisecting plane
			var intersectionNormal = translationPlane.normal.cross(plane.normal);

			// find the intersection point between the intersection line and the sphere:
				// The intersection point is a vector from the origin. Normalize it and then multiply it by the radius of the sphere to get a point on the surface of the sphere.
			// move the moveable point to the intersection point
		});

		// Create the cap circle vertices
		var circleVertices = [];
		circleVertices.push(findCircleCenterVertex()); // The first vert is the center point.

		var vertexCount = intersectingEdges.length;
		intersectingEdges.forEach(function(edge, i) {
			// doesn't actually put the vertices on the intersecting plane.
			var angle = Math.PI * 2 * i / vertexCount - Math.PI;
			var x = Math.cos(x) * sphere.radius;
			var y = Math.sin(x) * sphere.radius;
			var vertex = new THREE.Vector3(x, y, 0);
			circleVertices.push(vertex);
		});

		// Create the cap circle faces
		var facePlane = new THREE.Plane();
		var a, b, c, newFace;
		for(i = 1; i < vertexCount.length - 1; i++) {
			a = circleVertices[0];
			b = circleVertices[i];
			c = circleVertices[i + 1];

			facePlane.setFromCoplanarPoints(a, b, c);
			newFace = new THREE.Face3(a, b, c, facePlane.normal);
			geometry.faces.push(newFace);
		}

		geometry.dynamic = true;
		geometry.verticesNeedUpdate = true;
	}

	function findCircleCenterVertex() {
		return new THREE.Vector3(0, 0, 0);
	}

	function transformPlane(matrix, plane, planeGeometry) {
		plane.applyMatrix4(matrix);
		planeGeometry.applyMatrix(matrix);
	}

	(function() {
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
			camera.position.x = 800;
			camera.position.y = -600;
			camera.position.z = 400;
			camera.up = new THREE.Vector3(0, 0, 1);
			camera.lookAt(new THREE.Vector3(0, 0, 0));

			scene = new THREE.Scene();
			scene.add(new THREE.AmbientLight(0xffffff));

			controls = new THREE.TrackballControls(camera, renderer.domElement);
			controls.noPan = true;
		}

		function initObjects() {
			var mesh;
			var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
			var planeGeometry = new THREE.PlaneGeometry(800, 800, 4, 4);
			var planeMesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({
				color: 0xffff00,
				wireframe: true,
				transparent: true,
				opacity: 0.25
			}));
			scene.add(planeMesh);

			//transformPlane(new THREE.Matrix4().rotateX(Math.PI / 2), plane, planeGeometry);
			var transform = new THREE.Matrix4().translate(new THREE.Vector3(0, 0, 200));
			transformPlane(transform, plane, planeGeometry);

			initReferenceGrid();

			var sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 300);
			var subdivisions = 3;

			var geometry = new THREE.IcosahedronGeometry(sphere.radius, subdivisions);
			bisectAlongPlane(geometry, plane, sphere);
			colorVerticesBySphericalCoordinates(geometry, sphere.radius);

			var materials = [
				new THREE.MeshLambertMaterial({
					shading: THREE.SmoothShading,
					vertexColors: THREE.VertexColors
				}),
				new THREE.MeshBasicMaterial({
					color: 0,
					wireframe: true,
					transparent: true,
					opacity: 0.1
				})
			];

			mesh = new THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
			scene.add(mesh);
		}

		function startAnimation() {
			function animate() {
				window.setTimeout(function() {
					requestAnimationFrame(animate);
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
	})();
})();
