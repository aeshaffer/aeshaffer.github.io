// load("numeric-1.2.3.js");
// load("polynomials.js");

function abpolynomial(alphas, betas) {
    var alpha = alphas.sum();
    var beta = betas.sum();
    var f = function(t) { return rt2c(1,t);};
    var azeroes = alphas.map(f);
    var bzeroes = betas.map(f);
    var apoly = coeffs(azeroes);
    var bpoly = coeffs(bzeroes);
    var alphac = ni.mul(alpha).div(2).mul(-1).exp();
    var betac = ni.mul(beta).div(2).mul(-1).exp();

    var p = polymult([alphac], apoly);
    var q = polymult([betac], bpoly);

    var retval = {p: p, q: q, check: 0};

    retval.check = randalphasbetas(100).alphas.map(function(a) { return pqeval(retval, rt2c(1, a)); }).map(function(z) { return z.abs().x;}).sum();

    return retval;
}

function pqeval(pq, z) {
    var pe = peval(pq.p, z);
    var qe = peval(pq.q, z);
    return qe.sub(ni.mul(pe)).div(qe.add(ni.mul(pe)));
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

function pqzeroes(pq) {
    var poly = polysub(pq.q, polymult([ni], pq.p));
    return polyroots(poly);
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

function spacedpreimages(b, z, N) {
    var pis = preimage(b, z);
    function t(z) { return normalizeangle(z.angle()); }
    function o(a,b) { return a-b; }
    var pithetas = pis.map(t);
    pithetas.sort(o);
    var spacedthetas = [];
    for(var i = 0; i < b.length; i += N) {
	spacedthetas.push(pithetas[i]);
    }
    return {pis: pis, spaced: spacedthetas};
}

function piangles(b, t) {
    return preimage(b, rt2c(1,t)).map(function(z) { return z.angle(); });
}

function algorithmtest(b1, b2) {
    var b3 = bpcompose(b1, b2);

    console.log(piangles(b1, 0));
    console.log(piangles(b1, pi));
    console.log(piangles(b2, 0));
    console.log(piangles(b2, pi));
    console.log(piangles(b3, 0));
    console.log(piangles(b3, pi));
    
    var nonethetas = spacedpreimages(b3, nnone, b1.length);
    var onethetas = spacedpreimages(b3, none, b1.length);
    console.log(nonethetas);
    console.log(onethetas);
    var pq = abpolynomial(onethetas.spaced, nonethetas.spaced);
    console.log(pq.p.map(dcp));
    console.log(pq.q.map(dcp));

    console.log(nonethetas.spaced.map(function(t) { return pqeval(pq, rt2c(1, t));}).map(dcp));
    console.log(onethetas.spaced.map(function(t) { return pqeval(pq, rt2c(1, t));}).map(dcp));

    var innerzeroes = pqzeroes(pq);

    console.log(innerzeroes.map(dcp));
    console.log(innerzeroes.map(function(z) { return z.abs().x; }));
    console.log(innerzeroes.map(function(z) { return pqeval(pq, z);} ).map(dcp));

    return innerzeroes;
}

b1 = [nzero, none.div(2), ni.div(2)];

b2 = [nzero, none.div(-3), ni.div(-3), ni.add(none).div(3)];
