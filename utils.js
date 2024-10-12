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
        // you should paste the response of the chatGPT here:
		0.1767767, -0.3061862, 0.3535534, 0.3,
		0.3061862, 0.4267767, -0.1767767, -0.25,
		-0.3535534, 0.1767767, 0.4267767, 0,
		0, 0, 0, 1
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
    // calculate the model view matrix by using the transformation
    // methods and return the modelView matrix in this method
	// Step 1: Create the translation matrix (translate by 0.3 on x-axis, -0.25 on y-axis)
    const translationMatrix = createTranslationMatrix(0.3, -0.25, 0.0);

    // Step 2: Create the scaling matrix (scaling by 0.5 on x-axis and y-axis)
    const scaleMatrix = createScaleMatrix(0.5, 0.5, 1.0);

    // Step 3: Create the rotation matrices (convert degrees to radians first)
    const radianX = (30 * Math.PI) / 180; // 30 degrees to radians
    const radianY = (45 * Math.PI) / 180; // 45 degrees to radians
    const radianZ = (60 * Math.PI) / 180; // 60 degrees to radians

    const rotationMatrixX = createRotationMatrix_X(radianX);
    const rotationMatrixY = createRotationMatrix_Y(radianY);
    const rotationMatrixZ = createRotationMatrix_Z(radianZ);

    // Step 4: Multiply matrices in the order:
    // Translation -> Scaling -> RotationX -> RotationY -> RotationZ
    let modelViewMatrix = createIdentityMatrix(); // Start with the identity matrix
    modelViewMatrix = multiplyMatrices(modelViewMatrix, translationMatrix);  // Apply translation first
    modelViewMatrix = multiplyMatrices(modelViewMatrix, scaleMatrix);        // Apply scaling next
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixX);    // Apply rotation around X-axis
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixY);    // Apply rotation around Y-axis
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixZ);    // Apply rotation around Z-axis

    return new Float32Array(modelViewMatrix); // Return the final modelView matrix
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
    // this metdo should return the model view matrix at the given time
    // to get a smooth animation
	const currentTime = performance.now();
    const elapsedTime = (currentTime - startTime) / 1000; // in seconds
    const period = 10; // Total period is 10 seconds
    const halfPeriod = period / 2; // 5 seconds each way
    
    // Calculate time within current period (0 to 10 seconds)
    const timeInPeriod = elapsedTime % period;

    // Determine the interpolation factor
    let t;
    if (timeInPeriod <= halfPeriod) {
        // First half (0 to 5 seconds): interpolate from 0 to 1
        t = timeInPeriod / halfPeriod;
    } else {
        // Second half (5 to 10 seconds): interpolate from 1 to 0
        t = (period - timeInPeriod) / halfPeriod;
    }

    // Smooth interpolation using a sine curve for easing in and out
    const smoothT = Math.sin((t * Math.PI) / 2);

    // Step 1: Create the translation matrix (lerping between 0 and target)
    const translationMatrix = createTranslationMatrix(
        smoothT * 0.3, // Interpolate X-axis
        smoothT * -0.25, // Interpolate Y-axis
        0.0
    );

    // Step 2: Create the scaling matrix (interpolate scaling)
    const scaleMatrix = createScaleMatrix(
        1 + smoothT * (0.5 - 1), // Scaling in X-axis
        1 + smoothT * (0.5 - 1), // Scaling in Y-axis
        1.0
    );

    // Step 3: Create the rotation matrices
    const radianX = smoothT * (30 * Math.PI) / 180; // Interpolated X rotation
    const radianY = smoothT * (45 * Math.PI) / 180; // Interpolated Y rotation
    const radianZ = smoothT * (60 * Math.PI) / 180; // Interpolated Z rotation

    const rotationMatrixX = createRotationMatrix_X(radianX);
    const rotationMatrixY = createRotationMatrix_Y(radianY);
    const rotationMatrixZ = createRotationMatrix_Z(radianZ);

    // Step 4: Multiply matrices in the order:
    // Translation -> Scaling -> RotationX -> RotationY -> RotationZ
    let modelViewMatrix = createIdentityMatrix(); // Start with identity
    modelViewMatrix = multiplyMatrices(modelViewMatrix, translationMatrix);  // Apply translation
    modelViewMatrix = multiplyMatrices(modelViewMatrix, scaleMatrix);        // Apply scaling
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixX);    // Apply X rotation
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixY);    // Apply Y rotation
    modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrixZ);    // Apply Z rotation

    return new Float32Array(modelViewMatrix); // Return the calculated matrix
}



