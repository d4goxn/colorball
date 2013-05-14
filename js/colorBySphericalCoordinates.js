define(function(require) {
	'use strict';

	var THREE = require('three');

	var faceIndices = ['a', 'b', 'c', 'd'];

	return function(geometry, radius) {
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
	};
});
