/// <reference path="numeric-1.2.3.d.ts" />
/// <reference path="polynomials.ts" />

function sm<T>(A: Array<Array<T>>, rows: Array<number>, cols: Array<number>): Array<Array<T>> {
    return rows.map(function(r) { return cols.map(function(c) { return A[r][c];})});
}

function cdet(A: Array<Array<C>>): C {
    function tbtdet(B) {
	    return (B[0][0]).mul(B[1][1]).sub((B[0][1]).mul(B[1][0]));
    }

    var M0 = sm(A, [1,2], [1,2]);
    var M1 = sm(A, [1,2], [0,2]);
    var M2 = sm(A, [1,2], [0,1]);

    var t0 = A[0][0].mul(tbtdet(M0));
    var t1 = A[0][1].mul(tbtdet(M1));
    var t2 = A[0][2].mul(tbtdet(M2));

    return t0.sub(t1).add(t2);
}

class MT {
    a: C;
    b: C;
    c: C;
    d: C;
}

function gettransform(zs: Array<C>, ws: Array<C>): MT {

    var z1 = zs[0];
    var z2 = zs[1];
    var z3 = zs[2];
    var w1 = ws[0];
    var w2 = ws[1];
    var w3 = ws[2];

    var a = cdet([[z1.mul(w1), w1, none],
		  [z2.mul(w2), w2, none],
		  [z3.mul(w3), w3, none]]);
    
    var b = cdet([[z1.mul(w1), z1, w1],
		  [z2.mul(w2), z2, w2],
		  [z3.mul(w3), z3, w3]]);
    
    var c = cdet([[z1, w1, none],
		  [z2, w2, none],
		  [z3, w3, none]]);
    
    var d = cdet([[z1.mul(w1), z1, none],
		  [z2.mul(w2), z2, none],
		  [z3.mul(w3), z3, none]]);
    
    return {a:a, b:b, c:c, d:d};

}

function meval(mt: MT, z: C): C {
    var a = mt.a, b = mt.b, c = mt.c, d = mt.d;
    var num = a.mul(z).add(b);
    var den = c.mul(z).add(d);
    return num.div(den);
}