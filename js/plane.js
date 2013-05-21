/*global window:false*/

define(function(require) {
	'use strict';

	var THREE = require('three');

	var origin = new THREE.Vector3(0, 0, 0),
		up = new THREE.Vector3(0, 0, 1),
		position = new THREE.Vector3(),
		normal = new THREE.Vector3();

	function Plane(geometry, material) {
		THREE.Mesh.call(this, geometry, material);

		position.getPositionFromMatrix(this.matrix);
		normal.copy(position).normalize();
		var constant = normal.distanceTo(origin);

		this.plane = new THREE.Plane(normal, constant);
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

		// Isolate the rotation component of the matrix, see `http://www.arcsynthesis.org/gltut/Illumination/Tut09%20Normal%20Transformation.html`.
		var rotationMatrix = new THREE.Matrix4();
		rotationMatrix.getInverse(this.matrix).transpose();

		var rotation = new THREE.Quaternion();
		rotation.setFromRotationMatrix(rotationMatrix);

		this.plane.normal.copy(up);
		this.plane.normal.applyQuaternion(rotation);


		/*
		position.getPositionFromMatrix(this.matrix);

		if(position.equals(origin))
			this.plane.normal.copy(up);
		else
			this.plane.normal.copy(position).normalize();
		*/

		//this.plane.constant = position.distanceTo(origin);
	};

	return Plane;
});
