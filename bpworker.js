importScripts('numeric-1.2.3.js', 'polynomials.js', 'blaschke.js'); 

function rowcallback(i) {
    postMessage({rowComplete: i});
}

self.onmessage = function(event) {
    var as = event.data.as;
    var N = event.data.N;

    as = cifyrow(as);

    var bpzs = bpgrideval(N, as, rowcallback);

    postMessage({bpzs: bpzs.bpzs});
}

    