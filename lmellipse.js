// Ported from Python code originally located at:
// http://nicky.vanforeest.com/misc/fitEllipse/fitEllipse.html

var arcxs = [ 3.51182,  3.58677,  3.50432,  3.44992,  3.41224,  3.39515,  3.27298,  3.20485,  
	      3.11253,  2.94097,  2.88668,  2.71332,  2.63923,  2.47275,  2.28147,  2.10834,  
	      2.00382,  1.878  ,  1.69188,
              1.56785,  1.4722 ,  1.31048,  1.20466,  1.03061,  0.96586,  0.80022];

var arcys = [ 1.04312,  1.12758,  1.21515,  1.31683,  1.47263,  1.51821,  1.64427,  1.73452,  
	      1.75604,  1.86025,  1.88096,  1.94535,  2.00012,  2.03097,  2.01613,  2.09714,  
	      2.08792,  2.0529 ,  2.04301,
              2.00292,  1.94969,  1.91225,  1.82351,  1.75461,  1.69008,  1.62968];

function fitellipseZS(zs) {
    var xs = zs.map(function(z) { return z.x; });
    var ys = zs.map(function(z) { return fixy(z).y;});
    return fitellipse(xs,ys);
}

function fitellipse(xs,ys) {

    var D = [
	numeric.mul(xs,xs),
	numeric.mul(xs,ys),
	numeric.mul(ys,ys),
	xs,
	ys,
	xs.map(function(x) { return 1; }),
    ];

    // Turn the rows into columns.  (Matches sample python code.)
    D = numeric.transpose(D);
    var S = numeric.dot(numeric.transpose(D), D);
    var C = [
	[0,0 ,2,0,0,0],
	[0,-1,0,0,0,0],
	[2,0 ,0,0,0,0],
	[0,0 ,0,0,0,0],
	[0,0 ,0,0,0,0],
	[0,0 ,0,0,0,0]
    ];
    
    var SinvC = numeric.dot(numeric.inv(S), C)

    var EVS = numeric.eig(SinvC);

    var labs = numeric.abs(EVS.lambda.x);
    var mlambda = Math.max.apply(null, labs);
    var i = labs.indexOf(mlambda);

    return numeric.transpose(EVS.E.x)[i];

    // return EVS.E.getRow(i);
}

function ellipse_angle_of_rotation(ina) {
    var b=ina[1]/2, c=ina[2], d=ina[3]/2, f=ina[4]/2, g=ina[5], a=ina[0];
    return 0.5*numeric.atan(2*b/(a-c))
}

function ellipse_center(ina) {
    var b=ina[1]/2, c=ina[2], d=ina[3]/2, f=ina[4]/2, g=ina[5], a=ina[0];
    var num = b*b-a*c;
    var x0 = (c*d-b*f)/num;
    var y0 = (a*f-b*d)/num;
    return numeric.t(x0,y0);
}

function ellipse_axis_length(ina) {
    var b=ina[1]/2, c=ina[2], d=ina[3]/2, f=ina[4]/2, g=ina[5], a=ina[0];
    var up = 2*(a*f*f+c*d*d+g*b*b-2*b*d*f-a*c*g);
    var down1=(b*b-a*c)*( (c-a)*numeric.sqrt(1+4*b*b/((a-c)*(a-c)))-(c+a));
    var down2=(b*b-a*c)*( (a-c)*numeric.sqrt(1+4*b*b/((a-c)*(a-c)))-(c+a));
    var res1=numeric.sqrt(up/down1);
    var res2=numeric.sqrt(up/down2);
    var ret =[res1, res2];
    return ret;
/*     return [Math.max.apply(null, ret), 
	    Math.min.apply(null, ret)]; */
}

function ellipse_foci(ina) {
    var center = ellipse_center(ina);
    center = c.apply(null, center);
    var axislengths = ellipse_axis_length(ina);
    var angle = ellipse_angle_of_rotation(ina);

    var major = axislengths[0];
    var minor = axislengths[1];

    var rootC = Math.sqrt(major*major-minor*minor);
    var ctof = fixy(rt2c(rootC, angle));

    var f1 = center.add(ctof);
    var f2 = center.sub(ctof);
    return [f1, f2];
}