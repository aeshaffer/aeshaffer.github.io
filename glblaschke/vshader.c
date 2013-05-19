#ifdef THREE_JS
// Translate the demo variables into THREE.JS convention
#define uMVMatrix modelViewMatrix
#define uPMatrix projectionMatrix
#define aVertexPosition position
#define aTextureCoord uv
#else
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
#endif

varying highp vec2 vTextureCoord;

void main(void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  vTextureCoord = aTextureCoord;
}
