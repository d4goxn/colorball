define(function(require) {
	'use strict';

	var THREE = require('three'),
		colorBySphericalCoordinates = require('colorBySphericalCoordinates');

	var faceIndices = ['a', 'b', 'c', 'd'];

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

	return function(sphere, subdivisions) {

		this.bisectAlongPlane = function(plane) {
			/*
			The coordinates of the plane must be in the same space as geometry.vertices.
			*/
			
			var i;
			var vertex;
			var upperVertices = []; // I wish this was a set.
			geometry.faces = originalFaces;

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

				// Find faces to remove and find edges that intersect the plane.
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

			geometry.verticesNeedUpdate = true;
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
