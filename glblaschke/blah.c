#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

// https://gist.github.com/eieio/4109795

vec4 hsv_to_rgb(float h, float s, float v, float a)
{
    float c = v * s;
	h = mod((h * 6.0), 6.0);
	float x = c * (1.0 - abs(mod(h, 2.0) - 1.0));
	vec4 color;
 
	if (0.0 <= h && h < 1.0) {
		color = vec4(c, x, 0.0, a);
	} else if (1.0 <= h && h < 2.0) {
		color = vec4(x, c, 0.0, a);
	} else if (2.0 <= h && h < 3.0) {
		color = vec4(0.0, c, x, a);
	} else if (3.0 <= h && h < 4.0) {
		color = vec4(0.0, x, c, a);
	} else if (4.0 <= h && h < 5.0) {
		color = vec4(x, 0.0, c, a);
	} else if (5.0 <= h && h < 6.0) {
		color = vec4(c, 0.0, x, a);
	} else {
		color = vec4(0.0, 0.0, 0.0, a);
	}
 
	color.rgb += v - c;
 
	return color;
}

float cnorm(vec2 z) {
    return sqrt(z.x*z.x + z.y*z.y);
}

vec2 cmul(vec2 z1, vec2 z2) {
    return vec2(z1.x*z2.x - z1.y*z2.y, 
                z1.x*z2.y + z1.y*z2.x);
}

vec2 conj(vec2 z) {
    return vec2(z.x,-z.y);
}

vec2 cdiv(vec2 z1, vec2 z2) {    
    return cmul(z1, conj(z2)) / cnorm(z2);
}

struct numden {
    vec2 num;
    vec2 den;
};

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
    vec2 num = vec2(1.0,0.0);
    vec2 den = vec2(1.0,0.0);
    for(int i = 0; i < MAX_ZS; i++) {
      if(i < numzeroes) {
        num = cmul(num, nt(z, zeroes[i]));
        den = cmul(den, dt(z, zeroes[i]));
      }
    }
    numden retval;
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

void main()
{
    /* zeroes[0] = z0; */
    /* zeroes[1] = z1; */
    /* zeroes[2] = z2; */
    vec2 uv = vTextureCoord;
    vec2 z = uv*2.0 - vec2(1.0,1.0);  
    numden nd = bpeval2(z);
    vec2 bpz = cdiv(nd.num, nd.den);
    if(cnorm(z) <= 1.0) {
        float theta = atan(bpz.y, bpz.x) + 3.14;
        gl_FragColor = hsv_to_rgb(theta/6.28, 1.0, 1.0,1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }        
}
