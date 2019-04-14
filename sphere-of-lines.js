const VELOCITY_INCREMENTAL = 0.001;
const FOV = 100; 
const MOUSE_SENSITIVITY = 0.002;
const POINTS_COUNT = 4445;
const WORLD_RADIUS = 10;      
const SCENE_BG_COLOR = new THREE.Color( 0xcacbcc );
const LINE_COLOR = new THREE.Color( 0x1a1b1c );
const FOG_DENSITY = 0.22;

const KEY_UP = 38; 
const KEY_DOWN = 40;
const KEY_W = 87;
const KEY_S = 83;

let camera, velocity = 0, scene, renderer, points = [], lines = [];

let width = window.innerWidth;
let height = window.innerHeight;
let windowHalf = new THREE.Vector2( width / 2, height / 2 );

let lookDirection = new THREE.Vector3;
let mouse = new THREE.Vector2;
let target = new THREE.Vector2;

setup();
animate();

function setup() {
    setRenderer();
    setScene();
    setCamera();
    // Light is not needed, because LineBasicMaterial does not respond to lights anyway. 
    // Uncomment if you're going to add geometry with material where light matters. 
    // addLight();
    drawLines();
    addEventListeners();
}

function setRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( width, height );
    document.body.appendChild( renderer.domElement );
}

function setScene() {
    scene = new THREE.Scene();         
    scene.background = SCENE_BG_COLOR;
    scene.fog = new THREE.FogExp2( SCENE_BG_COLOR, FOG_DENSITY );
}

function setCamera() {
    camera = new THREE.PerspectiveCamera( FOV, width/height, 0.01, 1000 );
    camera.updateProjectionMatrix();

    // Move camera to initial position in front of space where lines are about to be drawn.
    camera.position.z = WORLD_RADIUS + 3;
}

function addLight() {
    let light = new THREE.AmbientLight( 0xffffff );
    scene.add( light );
}

function drawLines() {
    for( let i = 0; i < POINTS_COUNT; i++ ) {
        let position = getRandomPointInSphere();
        let point = new THREE.Vector3( position.x * WORLD_RADIUS, position.y * WORLD_RADIUS, position.z * WORLD_RADIUS );
        points.push( point );
    }

    for( let i = 0; i < POINTS_COUNT - 1; i++ ) {
        let geometry = new THREE.Geometry();

        geometry.vertices.push( new THREE.Vector3( points[ i ].x, points[ i ].y, points[ i ].z) );
        geometry.vertices.push( new THREE.Vector3( points[ i + 1 ].x, points[ i + 1 ].y, points[ i + 1 ].z) );
     
        let line = new THREE.Line( geometry, new THREE.LineBasicMaterial({ color:LINE_COLOR }) );

        lines.push( line )
        scene.add( line );
    }
}

function getRandomPointInSphere() {
    let u = Math.random();
    let v = Math.random();
    let theta = u * 2.0 * Math.PI;
    let phi = Math.acos( 2.0 * v - 1.0 );
    let r = Math.cbrt( Math.random() );
    let sinTheta = Math.sin( theta );
    let cosTheta = Math.cos( theta );
    let sinPhi = Math.sin( phi );
    let cosPhi = Math.cos( phi );
    let x = r * sinPhi * cosTheta;
    let y = r * sinPhi * sinTheta;
    let z = r * cosPhi;
    return { x: x, y: y, z: z };
}

function addEventListeners() {
    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'keydown', onKeyDown, false );
    window.addEventListener( 'resize', onResize, false );
}

function onMouseMove( event ) {
    mouse.x = ( event.clientX - windowHalf.x );
    mouse.y = ( event.clientY - windowHalf.y );
}

function onKeyDown( event ) {
    if( event.keyCode == KEY_UP || event.keyCode == KEY_W )
        velocity -= VELOCITY_INCREMENTAL;

    if( event.keyCode == KEY_DOWN || event.keyCode == KEY_S )
        velocity += VELOCITY_INCREMENTAL;    
}

function onResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    windowHalf.set( width / 2, height / 2 );

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );
}

function animate() {
    moveCamera();
    renderer.render( scene, camera );
    requestAnimationFrame( animate );        
}

function moveCamera() {
    target.x = ( 1 - mouse.x ) * MOUSE_SENSITIVITY;
    target.y = ( 1 - mouse.y ) * MOUSE_SENSITIVITY;

    camera.rotation.x += MOUSE_SENSITIVITY * ( target.y - camera.rotation.x );
    camera.rotation.y += MOUSE_SENSITIVITY * ( target.x - camera.rotation.y );
    camera.getWorldDirection( lookDirection );
    camera.position.x -= lookDirection.x * velocity;
    camera.position.y -= lookDirection.y * velocity;
    camera.position.z -= lookDirection.z * velocity;
}