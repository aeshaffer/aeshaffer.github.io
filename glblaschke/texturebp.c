#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

float cnorm(vec2 z) {
    return sqrt(z.x*z.x + z.y*z.y);
}

float cnorm2(vec2 z) {
    return z.x*z.x + z.y*z.y;
}

vec2 cmul(vec2 z1, vec2 z2) {
    return vec2(z1.x*z2.x - z1.y*z2.y, 
                z1.x*z2.y + z1.y*z2.x);
}

vec2 conj(vec2 z) {
    return vec2(z.x,-z.y);
}

vec2 cdiv(vec2 z1, vec2 z2) {    
    return cmul(z1, conj(z2)) / cnorm2(z2);
}

struct numden {
  vec2 lambda;
  vec2 num;
  vec2 den;
};

vec2 lt(vec2 z) {
  if(z.x == 0.0 && z.y == 0.0) {
    return vec2(1.0,0.0);
  } else {
    return conj(z) / cnorm(z);
  }
}

vec2 nt(vec2 z, vec2 a) {
    return z-a;
}

vec2 dt(vec2 z, vec2 a) {
    return vec2(1.0, 0.0) - cmul(conj(a), z);
}

const int MAX_ZS = 16;

uniform vec2 zeroes[MAX_ZS];
uniform int numzeroes;

numden bpeval2(vec2 z) {
  vec2 lambda = vec2(1.0,0.0);
  vec2 num = vec2(1.0,0.0);
  vec2 den = vec2(1.0,0.0);
  for(int i = 0; i < MAX_ZS; i++) {
    if(i < numzeroes) {
      lambda = cmul(lambda, lt(zeroes[i]));
      num = cmul(num, nt(z, zeroes[i]));
      den = cmul(den, dt(z, zeroes[i]));
    }
  }
  numden retval;
  retval.lambda = lambda;
  retval.num = num;
  retval.den = den;
  return retval;
}

float ntheta(float theta) {
    if(theta > 6.28) {
        return theta - 6.28;
    } 
    if(theta < 0.0) {
        return theta + 6.28;
    }
    return theta;
}

uniform sampler2D uSampler;

void main()
{
    /* zeroes[0] = z0; */
    /* zeroes[1] = z1; */
    /* zeroes[2] = z2; */
    vec2 uv = vTextureCoord;
    vec2 z = uv*2.0 - vec2(1.0,1.0);  
    if(cnorm(z) <= 1.0) {
      numden nd = bpeval2(z);
      vec2 bpz = cdiv(nd.num, nd.den);
      //bpz = cmul(nd.lambda, bpz);
      if(cnorm(bpz) <= 1.0) {
	gl_FragColor = texture2D(uSampler, vec2((1.0+bpz.x)/2.0, (1.0-bpz.y)/2.0));
      } else {
	gl_FragColor = vec4(1.0, 0.5, 0.5, (cnorm(bpz)-1.0));
      }
    } else {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }        
}
