var zs: numeric.T[];

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}

function goSVG() {
    var urlZS = window.location.search.replace(/^\?/, '');
    zs = parseZsString(urlZS);
    
    var skip: number = 1;
    var skipO = getQueryVariable("skip");
    if(skipO != null) { skip = parseInt(skipO);}

    var numangles: number = 1;
    var numanglesO = getQueryVariable("numangles");
    if(numanglesO != null) { numangles = parseInt(numanglesO);}


    calcanddrawtangentsSVG($("#cont"), zs, numangles, false, false, skip);
    encode_as_link();
}

function encode_as_link(){
    // Add some critical information
    $("#cont svg").attr({ version: '1.1' , xmlns:"http://www.w3.org/2000/svg"});

    var svg      = $("#cont svg").parent().html(),
        b64      = btoa(svg),
        download = $("#download"),
        html     = download.html();

    download.attr("href", 'data:image/svg+xml;base64,'+b64);
  }


function calcanddrawtangentsSVG(
    cont: JQuery,
    zs: numeric.T[],
    numangles: number,
    colorhue: boolean, fulllines: boolean,
    skip: number) {
    var tanpoints = calctangents(zs, numangles, skip);

    var svg = document.createElementNS('http://www.w3.org/2000/svg', "svg");

    svg.setAttribute("width", "1000");
    svg.setAttribute("height", "1000");
    svg.setAttribute("viewBox", "0 0 1 1");
    svg.setAttribute("stroke-width", ".005px");
    svg.setAttribute("style", "stroke:rgb(0,0,0)");

    cont.empty().append(svg);

    var g = document.createElementNS('http://www.w3.org/2000/svg', "g");
    g.setAttribute("transform", "translate(.5,.5) scale(.49,-.49)");
    svg.appendChild(g);
    var uc = document.createElementNS('http://www.w3.org/2000/svg', "circle");
    uc.setAttribute("cx", "0");
    uc.setAttribute("cy", "0");
    uc.setAttribute("r", "1");
    uc.setAttribute("fill", "none");
    g.appendChild(uc);

    // $("#svgthingy g line").remove();
    for (var z of zs) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        c.setAttribute("cx", z.x.toString());
        c.setAttribute("cy", z.y.toString());
        c.setAttribute("r", ".02");
        c.setAttribute("fill", "none");
        c.setAttribute("stroke-width", ".01px");
        g.appendChild(c);
    }
    for (var pts of tanpoints) {
        for (var i = 0; i < pts.length; i++) {
            var z1 = fixy(pts[i].z1);
            var z2 = fixy(pts[i].z2);
            var line = document.createElementNS('http://www.w3.org/2000/svg', "line");
            line.setAttribute("x1", z1.x.toString());
            line.setAttribute("y1", z1.y.toString());
            line.setAttribute("x2", z2.x.toString());
            line.setAttribute("y2", z2.y.toString());
            line.setAttribute("css", "stroke: black");
            g.appendChild(line);
        }
    }
 
    var z1z2pts = tanpoints.reduce((a, b) => a.concat(b));
    // var allpts2 = z1z2pts.concat(z1z2pts.map(x => new Z1Z2ZTan(x.z2, x.z1, x.ztan, x.lambdaangle)));
    z1z2pts = z1z2pts.sort((a, b) => a.z1.angle() - b.z1.angle());
    var allpts3 = z1z2pts;
    var polylinepath = "";
    for(var i = 0; i < allpts3.length; i++) {
        var intpts = calcinteresections(allpts3, i);
        var z1 = intpts.previntersection;
        polylinepath += z1.x.toString()+","+ z1.y.toString();
        
        // var line = document.createElementNS('http://www.w3.org/2000/svg', "line");
        // line.setAttribute("x1", z1.x.toString());
        // line.setAttribute("y1", z1.y.toString());
        // line.setAttribute("x2", z2.x.toString());
        // line.setAttribute("y2", z2.y.toString());
        // line.setAttribute("css", "stroke: red");
        // line.setAttribute("stroke", "red");
        // line.setAttribute("stroke-width", "2%");
        // g.appendChild(line);
    } 
    var polygon = document.createElementNS('http://www.w3.org/2000/svg', "polygon");
    polygon.setAttribute("points", polylinepath);
    polygon.setAttribute("fill", "none");
    polygon.setAttribute("stroke", "red");
    polygon.setAttribute("stroke-width", ".01px");
    g.appendChild(polygon);

}
