import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";
import { PlacedGeometry, Color } from "web-ifc/web-ifc-api";
import { IndicesArray } from "@babylonjs/core";
export declare class IfcLoader {
    constructor();
    private ifcAPI;
    initialize(): Promise<void>;
    load(name: string, file: string | Uint8Array, scene: BABYLON.Scene, mergematerials: any): Promise<BABYLON.Mesh>;
    getFlatMeshes(modelID: number): import("web-ifc/web-ifc-api").Vector<import("web-ifc/web-ifc-api").FlatMesh>;
    getPlacedGeometry(modelID: number, placedGeometry: PlacedGeometry, scene: BABYLON.Scene, mainObject: BABYLON.Nullable<BABYLON.Node>, meshmaterials: Map<number, BABYLON.Mesh>, mergematerials: any): Promise<BABYLON.Mesh | null>;
    getBufferGeometry(modelID: number, placedGeometry: PlacedGeometry, scene: BABYLON.Nullable<BABYLON.Scene>): BABYLON.Mesh | null;
    getVertexData(vertices: Float32Array, indices: IndicesArray): BABYLON.VertexData;
    getMeshMaterial(color: Color, scene: BABYLON.Scene): BABYLON.StandardMaterial;
}
