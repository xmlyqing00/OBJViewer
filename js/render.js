var objPath = './Leonardo.obj';
var scale = 4;
var INF = 100000000;

var container;

var camera, scene, renderer, controls, animationId;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var xCenter, yCenter, zCenter, zOffset;

$(document).ready(function () {
    $('#btn-upload')[0].disabled = false;
    $('#btn-default')[0].disabled = false;
});


function initScene() {

    container = $("#container")[0];

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = zOffset;

    // scene

    scene = new THREE.Scene();

    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff, 0.7);
    camera.add(pointLight);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = "scene";
    container.appendChild(renderer.domElement);

    // document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    // controls.maxDistance = scale * 8;
    controls.update();

}

function clearScene() {
    $("#stats").html("");
    $("#scene").remove();
    cancelAnimationFrame(animationId);
}

function showOBJ(data) {

    vertexCnt = 0;
    faceCnt = 0;
    xMin = INF, yMin = INF, zMin = INF;
    xMax = -INF, yMax = -INF, zMax = -INF;

    dataLines = data.split('\n');
    for (var i = 0; i < dataLines.length; i++) {
        if (dataLines[i][0] == 'v' && dataLines[i][1] == ' ') {
            vertexCnt++;
            vertexData = dataLines[i].split(' ');
            xMin = Math.min(xMin, vertexData[1]);
            xMax = Math.max(xMax, vertexData[1]);
            yMin = Math.min(yMin, vertexData[2]);
            yMax = Math.max(yMax, vertexData[2]);
            zMin = Math.min(zMin, vertexData[3]);
            zMax = Math.max(zMax, vertexData[3]);

        } else if (dataLines[i][0] == 'f' && dataLines[i][1] == ' ') {
            faceCnt++;
        } else {
            continue;
        }
    }

    xCenter = (xMin + xMax) / 2;
    yCenter = (yMin + yMax) / 2;
    zCenter = (zMin + zMax) / 2;
    zOffset = (zMax - zMin) * scale;

    console.log(xMin, xMax, yMin, yMax, zMin, zMax);
    $("#vertex-cnt").html("Vertex count: " + vertexCnt);
    $("#face-cnt").html("Triangle face count: " + faceCnt);

    initScene();

    var loader = new THREE.OBJLoader();
    mesh = loader.parse(data).children[0];
    mesh.geometry.translate(-xCenter, -yCenter, -zCenter);
    mesh.material.side = THREE.DoubleSide;
    scene.add(mesh);

    animate();
}

function uploadData() {
    console.log('Upload data');

    clearScene();

    var objFile = $("#obj-file")[0].files[0];

    var fileReader = new FileReader();

    fileReader.onload = function () {
        $('#stats').html("obj file loaded.");
        showOBJ(fileReader.result);
    };

    fileReader.onprogress = function (data) {
        if (data.lengthComputable) {
            var progress = parseInt(data.loaded / data.total * 100);
            $("#stats").html('obj ' + Math.round(progress, 2) + '% loaded');
        }
    };

    fileReader.onerror = function (err) {
        console.error("[ERR] An error happened when loading file.", err);
    }

    fileReader.readAsText(objFile);

}

function useDefaultData() {
    console.log('Use default data.')

    clearScene();

    // Load obj file
    var fileLoader = new THREE.FileLoader();

    fileLoader.load(

        objPath, // resource URL

        function (data) { // onLoad callback
            $('#stats').html("obj file loaded.");
            showOBJ(data);
        },

        function (xhr) { // onProgress callback
            var progress = Math.floor(xhr.loaded / xhr.total * 100);
            if (!isNaN(progress)) {
                $("#stats").html('obj ' + Math.round(progress, 2) + '% loaded');
            }
        },

        function (err) { // onError callback
            console.error("[ERR] An error happened when loading " + objPath + ".", err);
        }

    );
}


function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}


function animate() {

    animationId = requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
    // render();

}
