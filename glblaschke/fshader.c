varying highp vec2 vTextureCoord;

void main(void) {
  gl_FragColor = vec4(vTextureCoord.x, vTextureCoord.y, 0.0, 1.0);
}
