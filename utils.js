function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([
	  0.17677669, -0.3061862, 0.4330127, 0.3,
	  0.38388348,  0.3061862, -0.25,    -0.25,
	 -0.35355338,  0.4330127,  0.6123724,  0,
	  0,           0,          0,         1
	]);
    return getTransposeMatrix(transformationMatrix);
}


/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {
    // Create the translation matrix
    const translationMatrix = createTranslationMatrix(0.3, -0.25, 0);

    // Create the scaling matrix
    const scaleMatrix = createScaleMatrix(0.5, 0.5, 1);

    // Create the rotation matrices for X, Y, and Z
    const rotationMatrixX = createRotationMatrix_X(30 * Math.PI / 180); // Convert degrees to radians
    const rotationMatrixY = createRotationMatrix_Y(45 * Math.PI / 180);
    const rotationMatrixZ = createRotationMatrix_Z(60 * Math.PI / 180);

    // Combine the matrices in the order: T * Rz * Ry * Rx * S
    let modelViewMatrix = createIdentityMatrix();
    modelViewMatrix = multiplyMatrices(modelViewMatrix, translationMatrix); // Apply translation
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixZ);    // Apply rotation Z
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixY);    // Apply rotation Y
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixX);    // Apply rotation X
    modelViewMatrix = multiplyMatrices(modelViewMatrix, scaleMatrix);        // Apply scaling

    return new Float32Array(modelViewMatrix);
}

/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */
function getPeriodicMovement(startTime) {
	
	function interpolate(startValue, endValue, factor) {
    return startValue + (endValue - startValue) * factor;
}
    const time = (performance.now() / 1000 - startTime) % 10;  // Time in seconds, mod 10 for periodic movement
    const normalizedTime = time / 10; // Normalize time to [0, 1] over a 10-second period

    // Calculate the interpolation factor using a sine function for smooth back-and-forth motion
    const sineFactor = 0.5 * (1 - Math.cos(normalizedTime * 2 * Math.PI)); // Oscillates between 0 and 1

    // Interpolated translation
    const translationX = interpolate(0, 0.3, sineFactor);
    const translationY = interpolate(0, -0.25, sineFactor);

    // Interpolated scaling
    const scaleX = interpolate(1, 0.5, sineFactor);
    const scaleY = interpolate(1, 0.5, sineFactor);

    // Interpolated rotations
    const rotationX = interpolate(0, 30 * Math.PI / 180, sineFactor); // Rotation around X axis
    const rotationY = interpolate(0, 45 * Math.PI / 180, sineFactor); // Rotation around Y axis
    const rotationZ = interpolate(0, 60 * Math.PI / 180, sineFactor); // Rotation around Z axis

    // Create the transformation matrices for the current state
    const translationMatrix = createTranslationMatrix(translationX, translationY, 0);
    const scaleMatrix = createScaleMatrix(scaleX, scaleY, 1);
    const rotationMatrixX = createRotationMatrix_X(rotationX);
    const rotationMatrixY = createRotationMatrix_Y(rotationY);
    const rotationMatrixZ = createRotationMatrix_Z(rotationZ);

    // Combine the transformations: T * Rz * Ry * Rx * S
    let modelViewMatrix = createIdentityMatrix();
    modelViewMatrix = multiplyMatrices(modelViewMatrix, translationMatrix);  // Apply translation
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixZ);    // Apply rotation Z
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixY);    // Apply rotation Y
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixX);    // Apply rotation X
    modelViewMatrix = multiplyMatrices(modelViewMatrix, scaleMatrix);        // Apply scaling

    return new Float32Array(modelViewMatrix);
}





