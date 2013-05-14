/*global window:false*/

define(function(require) {
	'use strict';

	var THREE = require('three');

	var origin = new THREE.Vector3(0, 0, 0),
		position = new THREE.Vector3(),
		normal = new THREE.Vector3();

	var coplanarPoints = [];

	for(var i = 0; i < 3; i++) {
		coplanarPoints.push(new THREE.Vector3());
	}

	function Plane(geometry, material) {
		THREE.Mesh.call(this, geometry, material);

		position.getPositionFromMatrix(this.matrix);
		normal.copy(position).normalize();
		var constant = normal.distanceTo(origin);

		this.plane = new THREE.Plane(normal, constant);
		this.axisHelper = new THREE.AxisHelper(100);
	}

	Plane.prototype = Object.create(THREE.Mesh.prototype);

	Plane.prototype.updateMatrix = function() {
		THREE.Object3D.prototype.updateMatrix.call(this);
		this.updatePlane();
	};

	Plane.prototype.lookAt = function(vector) {
		THREE.Object3D.prototype.lookAt.call(this, vector);
		this.updatePlane();
	};

	Plane.prototype.updatePlane = function() {
		position.getPositionFromMatrix(this.matrix);
		this.plane.normal.copy(position).normalize();
		this.plane.constant = position.distanceTo(origin);

		this.plane.coplanarPoint(this.axisHelper.position);
		this.axisHelper.lookAt(origin);
	};

	return Plane;
});
