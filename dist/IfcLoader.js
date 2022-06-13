"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfcLoader = void 0;
require("@babylonjs/loaders/glTF");
const BABYLON = require("@babylonjs/core");
// import * as WEBIFC from "web-ifc/web-ifc-api";
const web_ifc_api_1 = require("web-ifc/web-ifc-api");
// import { IndicesArray } from "babylonjs/types";
class IfcLoader {
    constructor() {
        // private ifcAPI = new WEBIFC.IfcAPI();
        this.ifcAPI = new web_ifc_api_1.IfcAPI();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ifcAPI.Init();
        });
    }
    load(name, file, scene, mergematerials) {
        return __awaiter(this, void 0, void 0, function* () {
            var mToggle_YZ = [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1];
            var modelID = yield this.ifcAPI.OpenModel(name, file);
            yield this.ifcAPI.SetGeometryTransformation(modelID, mToggle_YZ);
            var flatMeshes = this.getFlatMeshes(modelID);
            scene.blockMaterialDirtyMechanism = true;
            // scene.useGeometryIdsMap = true;
            // scene.useMaterialMeshMap = true;
            var nodecount = 0;
            var currentnode = 0;
            var mainObject = new BABYLON.Mesh("custom", scene);
            var meshmaterials = new Map();
            var meshnode = new BABYLON.TransformNode("node" + currentnode, scene);
            for (var i = 0; i < flatMeshes.size(); i++) {
                var placedGeometries = flatMeshes.get(i).geometries;
                if (nodecount++ % 100 == 0) {
                    currentnode++;
                    meshnode = new BABYLON.TransformNode("node" + currentnode, scene);
                    meshnode.parent = mainObject;
                    meshmaterials = new Map();
                }
                for (var j = 0; j < placedGeometries.size(); j++) {
                    this.getPlacedGeometry(modelID, placedGeometries.get(j), scene, meshnode, meshmaterials, mergematerials);
                }
            }
            return mainObject;
        });
    }
    getFlatMeshes(modelID) {
        var flatMeshes = this.ifcAPI.LoadAllGeometry(modelID);
        return flatMeshes;
    }
    getPlacedGeometry(modelID, placedGeometry, scene, mainObject, meshmaterials, mergematerials) {
        return __awaiter(this, void 0, void 0, function* () {
            var meshgeometry = this.getBufferGeometry(modelID, placedGeometry, scene);
            if (meshgeometry != null) {
                var m = placedGeometry.flatTransformation;
                var matrix = new BABYLON.Matrix();
                matrix.setRowFromFloats(0, m[0], m[1], m[2], m[3]);
                matrix.setRowFromFloats(1, m[4], m[5], m[6], m[7]);
                matrix.setRowFromFloats(2, m[8], m[9], m[10], m[11]);
                matrix.setRowFromFloats(3, m[12], m[13], m[14], m[15]);
                // Some IFC files are not parsed correctly, leading to degenerated meshes
                try {
                    meshgeometry.bakeTransformIntoVertices(matrix);
                }
                catch (_a) {
                    console.warn("Unable to bake transform matrix into vertex array. Some elements may be in the wrong position.");
                }
                let color = placedGeometry.color;
                let colorid = Math.floor(color.x * 256) +
                    Math.floor(color.y * Math.pow(256, 2)) +
                    Math.floor(color.z * Math.pow(256, 3)) +
                    Math.floor(color.w * Math.pow(256, 4));
                if (mergematerials && meshmaterials.has(colorid)) {
                    var tempmesh = meshmaterials.get(colorid);
                    meshgeometry.material = tempmesh.material;
                    var mergedmesh = BABYLON.Mesh.MergeMeshes([tempmesh, meshgeometry], true, true);
                    if (mergedmesh) {
                        mergedmesh.name = colorid.toString(16);
                        // mergedmesh.material?.freeze();
                        // mergedmesh.freezeWorldMatrix();
                        meshmaterials.set(colorid, mergedmesh);
                        mergedmesh.parent = mainObject;
                    }
                }
                else {
                    var newMaterial = this.getMeshMaterial(color, scene);
                    meshgeometry.material = newMaterial;
                    // meshgeometry.material.freeze();
                    // meshgeometry.freezeWorldMatrix();
                    meshmaterials.set(colorid, meshgeometry);
                    meshgeometry.parent = mainObject;
                }
                return meshgeometry;
            }
            else
                return null;
        });
    }
    getBufferGeometry(modelID, placedGeometry, scene) {
        var geometry = this.ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);
        if (geometry.GetVertexDataSize() !== 0) {
            var vertices = this.ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
            var indices = this.ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
            var mesh = new BABYLON.Mesh("custom", scene);
            var vertexData = this.getVertexData(vertices, indices);
            vertexData.applyToMesh(mesh, false);
            return mesh;
        }
        else
            return null;
    }
    getVertexData(vertices, indices) {
        var positions = new Array(Math.floor(vertices.length / 2));
        var normals = new Array(Math.floor(vertices.length / 2));
        for (var i = 0; i < vertices.length / 6; i++) {
            positions[i * 3 + 0] = vertices[i * 6 + 0];
            positions[i * 3 + 1] = vertices[i * 6 + 1];
            positions[i * 3 + 2] = vertices[i * 6 + 2];
            normals[i * 3 + 0] = vertices[i * 6 + 3];
            normals[i * 3 + 1] = vertices[i * 6 + 4];
            normals[i * 3 + 2] = vertices[i * 6 + 5];
        }
        var vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.normals = normals;
        vertexData.indices = indices;
        return vertexData;
    }
    getMeshMaterial(color, scene) {
        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
        myMaterial.emissiveColor = new BABYLON.Color3(color.x, color.y, color.z);
        // if material has alpha - make it fully transparent for performance
        myMaterial.alpha = color.w < 1.0 ? 0 : 1;
        myMaterial.sideOrientation = BABYLON.Mesh.DOUBLESIDE;
        myMaterial.backFaceCulling = false;
        myMaterial.disableLighting = true;
        return myMaterial;
    }
}
exports.IfcLoader = IfcLoader;
//# sourceMappingURL=IfcLoader.js.map