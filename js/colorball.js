define(function(require) {
	'use strict';

	var THREE = require('three'),
		colorBySphericalCoordinates = require('colorBySphericalCoordinates');

	var faceIndices = ['a', 'b', 'c', 'd'];

	var materials = [
		new THREE.MeshLambertMaterial({
			shading: THREE.SmoothShading,
			vertexColors: THREE.VertexColors,
			side: THREE.DoubleSide
		}),
		new THREE.MeshBasicMaterial({
			color: 0,
			wireframe: true,
			transparent: true,
			opacity: 0.1
		})
	];

	return function(sphere, subdivisions) {

		this.bisectAlongPlane = function(plane) {
			/*
			The coordinates of the plane must be in the same space as geometry.vertices.
			*/
			
			var i, j, face, vertex, verticesPerFace;
			var upperVertices = []; // I wish this was a set.
			geometry.faces = originalFaces;

			for(i = 0; i < geometry.vertices.length; i++) {
				vertex = geometry.vertices[i];
				if(plane.distanceToPoint(vertex) >= 0)
					upperVertices.push(vertex);
			}

			// Remove faces that are above the plane.
			var remainingFaces = [];
			var intersectingEdges = [];
			for(i = 0; i < geometry.faces.length; i++) {
				face = geometry.faces[i];
				verticesPerFace = (face instanceof THREE.Face3)? 3: 4;
				var isFaceAbovePlane = true;

				// Find faces to remove and find edges that intersect the plane.
				var lastVertex;
				var isLastVertexAbovePlane;
				for(j = 0; j < verticesPerFace; j++) {
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

			// Slide vertices that are above the plane down to the plane.
			// Find all unique vertices in the intersecting edges that are above the plane.
			var edgeVerts = {};
			for(i = 0; i < intersectingEdges.length; i++) {
				for(j = 0; i < 2; j++) {
					vertex = intersectingEdges[i][j];
					if(vertex && plane.distanceToPoint(vertex) > 0)
						edgeVerts[vertex] = vertex;
				}
			}

			// Move each vertex to it's new location on the intersection of the sphere and the plane.
			for(i in edgeVerts) {
				var rotationAxis = (new THREE.Vector3()).copy(plane.normal).dot(edgeVerts[i]);
				var y = plane.constant / sphere.radius;
				var angleFromNorm = Math.asin(y);
				var q = (new THREE.Quaternion()).fromAxisAngle(rotationAxis, angleFromNorm);
				var position = (new THREE.Vector3()).copy(plane.normal).applyQuaternion(q);
				edgeVerts[i].copy(position);
			}

			geometry.verticesNeedUpdate = true;
			geometry.colorsNeedUpdate = true;
		};

		this.updateColors = function() {
			colorBySphericalCoordinates(geometry, sphere.radius);
		};

		var geometry = new THREE.IcosahedronGeometry(
			sphere.radius,
			subdivisions || 1
		);
		geometry.dynamic = true;

		this.mesh = new THREE.SceneUtils.createMultiMaterialObject(
			geometry, materials);

		var originalFaces = geometry.faces;

		this.updateColors();

	};
});
