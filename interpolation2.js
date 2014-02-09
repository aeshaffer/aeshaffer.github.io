// load("numeric-1.2.3.js");
// load("polynomials.js");

function o(a,b) { return a-b; }
function t2c(t) { return rt2c(1,t); }

function abpolynomial(inalphas, inbetas) {
    var alphas = inalphas.map(normalizeangle);
    var betas = inbetas.map(normalizeangle);
    alphas.sort(o);
    betas.sort(o);
    var flipab = !(alphas[0] < betas[0]);
    if(flipab) {
	var temp = alphas; alphas = betas; betas = temp;
    }
    var alpha = alphas.sum();
    var beta = betas.sum();
    var azeroes = alphas.map(t2c);
    var bzeroes = betas.map(t2c);
    var apoly = coeffs(azeroes);
    var bpoly = coeffs(bzeroes);
    var alphac = ni.mul(alpha).div(2).mul(-1).exp();
    var betac = ni.mul(beta).div(2).mul(-1).exp();

    var p = polymult([alphac], apoly);
    var q = polymult([betac], bpoly);

    var retval = {p: p, q: q, 
		  phi : flipab ? function(z) { return z.mul(-1);} : function(z) { return z; }, 
		  check: 0};

    retval.check = randalphasbetas(100).alphas.map(function(a) { return pqeval(retval, rt2c(1, a)); }).map(function(z) { return z.abs().x;}).sum();

    return retval;
}

function pqeval(pq, z) {
    var pe = peval(pq.p, z);
    var qe = peval(pq.q, z);
    var retval = qe.sub(ni.mul(pe)).div(qe.add(ni.mul(pe)));
    return pq.phi(retval);
}

function randalphasbetas(N) {
    arr = []; 
    for(i = 0; i < 2*N;i++) { arr.push(Math.random()*2*pi);}
    arr.sort(function(a,b) { return a-b;})
    alphas = [];
    betas = []
    for(i = 0; i < N; i++) {
	alphas[i] = arr[2*i];
	betas[i] = arr[2*i+1];
    }
    return {alphas: alphas, betas: betas};
}

function pqpreimages(pq, c) {
    var q = pq.q, ip = polymult([ni], pq.p);
    var num = polysub(q, ip);
    var den = polyadd(q, ip);
    var poly = polysub(num, polymult([c], den));
    return polyroots(poly);
}

function pqzeroes(pq) {
    var q = pq.q, ip = polymult([ni], pq.p);
    var num = polysub(q, ip);
    return polyroots(num);
}

function test(ab, pq) {
    zeroes = pqzeroes(pq);    
    function ev(t) {
	return dcp(pqeval(pq, rt2c(1, t)));
    }
    function evbp(t) {
	return dcp(bpeval(zeroes, rt2c(1, t)));
    }
    print(ab.alphas.map(ev));
    print(ab.alphas.map(evbp));
    print(ab.betas.map(ev));
    print(ab.betas.map(evbp));
}

// N is the guessed size of the inner factor.
function spacedpreimages(b, z, N) {
    // Get angles that b maps to arg(z)
    var pithetas = piangles(b, z.angle());
    pithetas.sort(o);
    var spacedthetas = [];
    var spacedthetas2 = [];
    // Get pithetas[0,N,2N,...]
    // and pithetas[1,N+1,2N+1, ...]
    for(var i = 0; i < b.length; i += N) {
	spacedthetas.push(pithetas[i]);
	spacedthetas2.push(pithetas[i+1]);
    }
    return [spacedthetas, spacedthetas2];
}

function piangles(b, t) {
    return preimage(b, rt2c(1,t)).map(function(z) { return normalizeangle(z.angle()); });
}

function bppqcompare(b1) {
    var b1onethetas = piangles(b1, 0);
    var b1nonethetas = piangles(b1, pi);
    var pq1 = abpolynomial(b1onethetas, b1nonethetas);
    var pq1zeroes = pqzeroes(pq1);
    console.log(pq1zeroes.map(dcp));
    console.log(b1onethetas.map(function(t) { return pqeval(pq1, rt2c(1, t));}).map(dcp));
    console.log(b1nonethetas.map(function(t) { return pqeval(pq1, rt2c(1, t));}).map(dcp));
}

function comparepes(bp, pq, z) {
    return {
	pqvals : preimage(b2, z).map(function(z) { return pqeval(pq, z); }).map(dcp),
	bpvals : pqpreimages(pq, z).map(function(z) { return bpeval(bp, z); }).map(dcp)
    };
}

function algorithmtest0(b1, b2) {
    var b3 = bpcompose(b1, b2);
    var N = b1.length;
    var retval =  algorithmtest(b3, N);

    var Binvs = retval.Binvs;
    var w0 = retval.w0;
    var pq = retval.pq;

    var z1 = t2c(Binvs[0][0]);
    var z2 = t2c(Binvs[1][0]);
    var cz1 = bpeval(b2, z1);
    var cz2 = bpeval(b2, z2);    

    var origpqzeroes = pqzeroes(pq);
    Binvs[0].map(function(t) { return pqeval(pq, t2c(t));}).map(dcp);
    Binvs[1].map(function(t) { return pqeval(pq, t2c(t));}).map(dcp);
    Binvs[0].map(function(t) { return bpeval(b2, t2c(t));}).map(dcp);
    Binvs[1].map(function(t) { return bpeval(b2, t2c(t));}).map(dcp);

    var wz1 = pqeval(pq, z1);
    var wz2 = pqeval(pq, z2);

    var ws = [w0, wz1, wz2];
    var zs = [nzero, cz1, cz2];
    var phi = gettransform(ws, zs);

    return retval;

}

function hextest() {
    var delta = 2*Math.PI/6;
    var alphas = [0*delta, 1*delta, 2*delta, 3*delta, 4*delta, 5*delta];
    var betas = alphas.map(function(t) { return t + delta/2; });
    var pq = interpolate([alphas, betas]);
}
 
function algorithmtest(b3, N) {
    var Binvs = spacedpreimages(b3, nnone, N);
 
/*
    piangles(b3, nnone.angle());
    Binvs[0].map(function(t) { return bpeval(b3, t2c(t));}).map(dcp);
    Binvs[1].map(function(t) { return bpeval(b3, t2c(t));}).map(dcp);
*/
    
    // Identifies the two sets of points, but not to the 
    // correct angle.
    return interpolate(Binvs);
}

// Return a Blaschke product which identifies idpoints[0] to 1 
// and idpoints[1] to -1.

function interpolate(idpoints) {
    var pq = abpolynomial(idpoints[0], idpoints[1]);
    var pqzeroes = pqpreimages(pq, nzero);
    var w0 = pqeval(pq, nzero);
    var innerzeroes = pqpreimages(pq, w0);

    return {zeroes: innerzeroes, Binvs : idpoints, pq: pq, w0: w0, pqzeroes: pqzeroes};
}



    
    
    //var onethetas = spacedpreimages(b3, none, b1.length);
/*
    console.log(nonethetas);
    console.log(onethetas);
    var pq = abpolynomial(onethetas.spaced, nonethetas.spaced);
    console.log(pq.p.map(dcp));
    console.log(pq.q.map(dcp));

    var innerzeroes = pqzeroes(pq);

    console.log(innerzeroes.map(dcp));
    console.log(innerzeroes.map(function(z) { return z.abs().x; }));
    console.log(innerzeroes.map(function(z) { return pqeval(pq, z);} ).map(dcp));

    function pqe(t) { return dcp(pqeval(pq, t2c(t))); }
    function bpe(t) { return dcp(bpeval(innerzeroes, t2c(t))); }
    
    console.log(nonethetas.spaced.map(pqe));
    console.log(nonethetas.spaced.map(bpe));
    console.log(onethetas.spaced.map(pqe));
    console.log(onethetas.spaced.map(bpe));
*/

b1 = [nzero, none.div(2), ni.div(2)];

b2 = [nzero, none.div(-3), ni.div(-3), ni.add(none).div(3), ni.div(2).sub(none.div(2))];
