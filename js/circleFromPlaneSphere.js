define(function() {
	return function(plane, sphere) {
		var geometry = new THREE.Geometry();

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

		return geometry;
	};
});
